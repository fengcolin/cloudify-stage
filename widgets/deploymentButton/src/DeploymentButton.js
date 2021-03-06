/**
 * Created by kinneretzin on 18/10/2016.
 */


import DeployModal from './DeployModal';

export default class extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = {
            open: false,
            loading: false,
            error: null,
            blueprints: {items:[]}
        }
    }

    _createDeployment(){
        this.setState({loading: true});

        var actions = new Stage.Common.BlueprintActions(this.props.toolbox);
        actions.doGetBlueprints().then((blueprints)=>{
            this.setState({loading: false, error: null, blueprints, open: true});
        }).catch((err)=> {
            this.setState({loading: false, error: err.message});
        });
    }

    _hideModal () {
        this.setState({open: false});
    }

    render() {
        let {Button, ErrorMessage} = Stage.Basic;

        return (
            <div>
                <ErrorMessage error={this.state.error} onDismiss={() => this.setState({error: null})} autoHide={true}/>

                <Button color='green' icon='rocket' content='Create Deployment' labelPosition='left' fluid
                        loading={this.state.loading} onClick={this._createDeployment.bind(this)} />

                <DeployModal open={this.state.open} blueprints={this.state.blueprints}
                             onHide={this._hideModal.bind(this)} toolbox={this.props.toolbox}/>
            </div>
        );
    }
}