/**
 * Created by kinneretzin on 07/09/2016.
 */

addPlugin({
    name: "topology",
    description: 'blah blah blah',
    initialWidth: 8,
    initialHeight: 4,
    color: "yellow",
    render: function(plugin,context,pluginUtils) {
        if (!plugin.template) {
            return 'Topology: missing template';
        }

        return pluginUtils.buildFromTemplate(plugin.template);

    }
});