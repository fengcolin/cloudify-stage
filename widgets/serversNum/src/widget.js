/**
 * Created by pawelposel on 04/11/2016.
 */

Stage.defineWidget({
    id: "serversNum",
    name: "Number of nodes",
    description: 'Number of nodes',
    initialWidth: 2,
    initialHeight: 8,
    color : "red",
    showHeader: false,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('serversNum'),
    categories: [Stage.GenericConfig.CATEGORY.CHARTS_AND_STATISTICS],
    
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(30)
    ],
    fetchUrl: '[manager]/node-instances?state=started&_include=id&_sort=deployment_id&_size=1',

    render: function(widget,data,error,toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }

        var num = _.get(data, "metadata.pagination.total", 0);
        let KeyIndicator = Stage.Basic.KeyIndicator;

        return (
            <KeyIndicator title="Nodes" icon="server" number={num}/>
        );
    }
});