using System;
using System.IO;
using System.Linq;
using System.Net.Http.Formatting;
using System.Web;
using umbraco;
using umbraco.BusinessLogic.Actions;
using Umbraco.Core;
using Umbraco.Web.Models.Trees;
using Umbraco.Web.Mvc;
using Umbraco.Web.Trees;

namespace AceUmbraco.Controllers
{
    [PluginController("ViewsEditor")]
    [Tree("settings", "ViewsEditorTree", "Views")]
    public class ViewsEditorTreeController : TreeController
    {
        protected override TreeNodeCollection GetTreeNodes(string id, FormDataCollection queryStrings)
        {
            var subDir = id == "-1" ? string.Empty : id;
            var dirinfo = new DirectoryInfo(HttpContext.Current.Server.MapPath("~/Views/" + subDir));

            var tree = BuildTree(dirinfo.FullName, queryStrings, id);

            return tree;
        }

        private TreeNodeCollection BuildTree(string path, FormDataCollection queryStrings, string parentId)
        {
            var treeNodeCollection = new TreeNodeCollection();

            try
            {
                var viewsFolder = new DirectoryInfo(HttpContext.Current.Server.MapPath("~/Views/")).FullName;

                var dir = new DirectoryInfo(path);
                var subDirs = dir.GetDirectories();

                var files = dir.GetFiles().Where(x => x.Name.InvariantEndsWith(".cshtml"));

                foreach (var fi in files)
                {
                    var id = fi.FullName.Replace(viewsFolder, string.Empty);
                    var fileNameWithoutExtension = fi.Name.Substring(0, fi.Name.LastIndexOf('.'));
                    var treeNode = CreateTreeNode(id, parentId, queryStrings, fileNameWithoutExtension, "icon-document");
                    treeNodeCollection.Add(treeNode);
                }

                foreach (var sd in subDirs)
                {
                    var hasChildren = sd.GetFiles().Any(x => x.Name.InvariantEndsWith(".cshtml"));

                    var id = sd.FullName.Replace(viewsFolder, string.Empty);
                    var dirNode = CreateTreeNode(id, parentId, queryStrings, sd.Name, "icon-folder", hasChildren);
                    treeNodeCollection.Add(dirNode);
                }

            }
            catch (Exception ex)
            {
                //TODO: log this
            }

            return treeNodeCollection;
        }

        protected override MenuItemCollection GetMenuForNode(string id, FormDataCollection queryStrings)
        {
            var menu = new MenuItemCollection();
            if (id.EndsWith(".cshtml") == false)
            {
                menu.Items.Add<ActionNew>("Create");
            }

            menu.Items.Add<RefreshNode, ActionRefresh>(ui.Text("actions", ActionRefresh.Instance.Alias), true);

            return menu;
        }
    }
}