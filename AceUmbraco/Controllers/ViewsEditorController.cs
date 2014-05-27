﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json;
using Umbraco.Web.WebApi;

namespace AceUmbraco.Controllers
{
    public class ViewsEditorController : UmbracoAuthorizedApiController
    {
        public ViewFile GetByPath(string path)
        {
            var contents = GetViewContents(path);

            var layout = GetLayout(contents);

            var sections = new List<Section>();

            if (layout != null)
            {
                var layoutContents = GetViewContents(layout);
                sections = GetSections(layoutContents).OrderBy(x => x.Name).ToList();
            }

            return new ViewFile { Value = contents, FileName = path, Layout = layout, Sections = sections };
        }

        private static string GetViewContents(string path)
        {
            string contents = null;

            if (path.IsValidViewFile())
            {
                var file = new FileInfo(HttpContext.Current.Request.MapPath("~/Views/" + path));
                using (var reader = new StreamReader(file.FullName))
                { 
                    contents = reader.ReadToEnd();
                }
            }
            return contents;
        }

        public HttpResponseMessage PutSaveView([FromBody]ViewFile view)
        {
            var ct = JsonConvert.DeserializeObject<string>(view.Value);

            if (view.FileName.IsValidViewFile())
            {
                var file = new FileInfo(HttpContext.Current.Request.MapPath("~/Views/" + view.FileName));

                using (var viewFile = new StreamWriter(file.FullName, false))
                {
                    viewFile.WriteLine(ct);
                }
            }

            return new HttpResponseMessage(System.Net.HttpStatusCode.OK);
        }

        internal string GetLayout(string contents)
        {
            // Match on: 
            //		The word "Layout"
            //		then optional whitespace of any length
            //		until equals sign
            //		then optional whitespace of any length
            //		until 1 double quote
            //		then any characters (non greedy) - this is a group and will be used to get the value
            //		until 1 double quote
            //		then optional whitespace of any length	
            //		until 1 semicolon
            const string pattern = "Layout\\s*=\\s*\"{1}(.*?)\"{1}\\s*;";

            var match = Regex.Match(contents, pattern);
            var layout = match.Groups[1].Value.Trim();

            return layout == string.Empty ? null : layout;
        }

        internal List<Section> GetSections(string contents)
        {
            var allIndexOf = contents.AllIndexOf("@RenderSection", StringComparison.OrdinalIgnoreCase);
            var sections = new List<Section>();

            foreach (var index in allIndexOf)
            {
                var start = contents.Substring(index);
                var end = start.Substring(0, start.IndexOf(')'));
                var sectionPart = contents.Substring(index, end.Length + 2);

                var values = sectionPart.Replace("@RenderSection", string.Empty).Replace("\r", string.Empty).Replace("\n", string.Empty).Trim();
                var noParentheses = values.Substring(1, values.Length - 2).Trim();
                var splitValues = noParentheses.Split(',');
                var sectionName = splitValues[0].Replace("\"", string.Empty);

                // If no answer is specified then it defaults to true, else parse the actual value
                var sectionRequired = true;
                if (splitValues.Length > 1)
                    bool.TryParse(splitValues[1], out sectionRequired);
                
                sections.Add(new Section { Name = sectionName, Required = sectionRequired });
            }

            return sections;
        }
    }

    public class Section
    {
        public string Name { get; set; }
        public bool Required { get; set; }
    }

    public class ViewFile
    {
        public string Value { get; set; }
        public string FileName { get; set; }
        public string Layout { get; set; }
        public List<Section> Sections { get; set; }
    }

    public static class ViewExtensions
    {
        public static bool IsValidViewFile(this string path)
        {
            return path.EndsWith(".cshtml") && path.Contains("..") == false;
        }
    }

    public static class StringExtensions
    {
        public static IList<int> AllIndexOf(this string text, string str, StringComparison comparisonType)
        {
            IList<int> allIndexOf = new List<int>();
            int index = text.IndexOf(str, comparisonType);
            while (index != -1)
            {
                allIndexOf.Add(index);
                index = text.IndexOf(str, index + str.Length, comparisonType);
            }
            return allIndexOf;
        }
    }
}