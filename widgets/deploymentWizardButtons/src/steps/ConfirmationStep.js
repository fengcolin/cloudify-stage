/**
 * Created by jakub.niezgoda on 31/07/2018.
 */

import { Component } from 'react';
import React from 'react';

const confirmationStepId = 'confirm';

class ConfirmationStepActions extends Component {

    static propTypes = Stage.Basic.Wizard.Step.Actions.propTypes;

    onNext(id) {
        return this.props.onLoading(id)
            .then(this.props.fetchData)
            .then(({stepData}) => this.props.onNext(id, {tasks: stepData.tasks}))
            .catch((error) => this.props.onError(id, error));
    }

    render() {
        let {Wizard} = Stage.Basic;
        return <Wizard.Step.Actions {...this.props} onNext={this.onNext.bind(this)}
                                    nextLabel='Install' nextIcon='download' />
    }
}

class ConfirmationStepContent extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            stepData: {
                tasks: []
            }
        };
    }

    static propTypes = Stage.Basic.Wizard.Step.Content.propTypes;

    static defaultVisibility = Stage.Common.Consts.defaultVisibility;

    chooseId(baseId, promise, idName) {
        const maxSuffixNumber = 1000;
        const isIdInList = (items, id) => !_.isUndefined(_.find(items, {id}));

        let id = baseId;
        let idChosen = false;
        return promise()
            .then(({items}) => {
                idChosen = !isIdInList(items, id);

                for (let i = 0; i < maxSuffixNumber && !idChosen; i++) {
                    id = `${baseId}_${i}`;
                    idChosen = !isIdInList(items, id);
                }

                return idChosen
                    ? Promise.resolve(id)
                    : Promise.reject(`Not found unused ${idName} ID.`);
            });
    }

    addPluginsTasks(plugins, tasks) {
        const pluginActions = new Stage.Common.PluginActions(this.props.toolbox);

        for (let pluginName of _.keys(plugins)) {
            const plugin = plugins[pluginName];
            tasks.push({
                name: `Upload plugin ${pluginName}`,
                promise: () =>
                    pluginActions.doUpload(ConfirmationStepContent.defaultVisibility,
                                           plugin.wagonUrl, plugin.yamlUrl, plugin.wagonFile, plugin.yamlFile)
            });
        }

        return Promise.resolve();
    }

    addSecretsTasks(secrets, tasks) {
        const secretActions = new Stage.Common.SecretActions(this.props.toolbox);

        for (let secretKey of _.keys(secrets)) {
            const secretValue = secrets[secretKey];
            tasks.push({
                name: `Create secret ${secretKey}`,
                promise: () => secretActions.doCreate(secretKey, secretValue, ConfirmationStepContent.defaultVisibility, false)
            })
        }

        return Promise.resolve();
    }

    chooseBlueprintId(initialBlueprintId) {
        const blueprintActions = new Stage.Common.BlueprintActions(this.props.toolbox);
        return this.chooseId(initialBlueprintId, () => blueprintActions.doGetBlueprints({_search: initialBlueprintId}), 'blueprint');
    }

    addBlueprintUploadTask(blueprint, tasks) {
        const blueprintActions = new Stage.Common.BlueprintActions(this.props.toolbox);

        tasks.push({
            name: `Upload blueprint ${blueprint.blueprintName}`,
            promise: () => blueprintActions.doUpload(blueprint.blueprintName, blueprint.blueprintYaml, blueprint.blueprintUrl, null, blueprint.blueprintImageUrl, null, ConfirmationStepContent.defaultVisibility)
        });

        return Promise.resolve();
    }

    chooseDeploymentId(initialDeploymentId) {
        const deploymentActions = new Stage.Common.DeploymentActions(this.props.toolbox);
        return this.chooseId(initialDeploymentId, () => deploymentActions.doGetDeployments({_search: initialDeploymentId}), 'deployment');
    }

    addDeployBlueprintTask(deploymentId, blueprintId, inputs, tasks) {
        const blueprintActions = new Stage.Common.BlueprintActions(this.props.toolbox);
        const executionActions = new Stage.Common.ExecutionActions(this.props.toolbox);

        const waitForDeploymentIsCreated = async () => {
            const maxNumberOfRetries = 10;
            const waitingInterval = 1000; //ms

            let deploymentCreated = false;
            for (let i = 0; i < maxNumberOfRetries && !deploymentCreated; i++) {
                await new Promise(resolve => setTimeout(resolve, waitingInterval))
                    .then(() => executionActions.doGetExecutions(deploymentId))
                    .then(({items}) => {
                        deploymentCreated = _.isUndefined(_.find(items, {ended_at: null}));
                    });
                console.error(i, deploymentCreated);
            }
        };

        tasks.push({
            name: `Deploy ${blueprintId} blueprint as ${deploymentId}`,
            promise: () => blueprintActions.doDeploy({id: blueprintId}, deploymentId, inputs, ConfirmationStepContent.defaultVisibility)
                .then(() => waitForDeploymentIsCreated())
        });

        return Promise.resolve();
    }

    addRunInstallWorkflowTask(deploymentId, tasks) {
        const deploymentActions = new Stage.Common.DeploymentActions(this.props.toolbox);

        tasks.push({
            name: `Execute install workflow on ${deploymentId} deployment`,
            promise: () => deploymentActions.doExecute({id: deploymentId}, {name: 'install'}, {}, false)
        });

        return Promise.resolve();
    }

    componentDidMount() {
        const wizardData = this.props.wizardData;

        let tasks = [];
        let blueprintId = '';
        let deploymentId = '';

        this.props.onLoading(this.props.id)
            .then(() => this.addPluginsTasks(wizardData.plugins, tasks))
            .then(() => this.addSecretsTasks(wizardData.secrets, tasks))
            .then(() => this.chooseBlueprintId(wizardData.blueprint.blueprintName))
            .then((id) => {blueprintId = id; return this.addBlueprintUploadTask({...wizardData.blueprint, blueprintName: id}, tasks)})
            .then(() => this.chooseDeploymentId(wizardData.blueprint.blueprintName))
            .then((id) => {deploymentId = id; this.addDeployBlueprintTask(id, blueprintId, wizardData.inputs, tasks)})
            .then(() => this.addRunInstallWorkflowTask(deploymentId, tasks))
            .then(() => ({stepData: {tasks}}))
            .then((newState) => new Promise((resolve) => this.setState(newState, resolve)))
            .then(() => this.props.onChange(this.props.id, this.state.stepData))
            .catch((error) => this.props.onError(this.props.id, error))
            .finally(() => this.props.onReady(this.props.id));
    }

    render() {
        let {Header, List, Wizard} = Stage.Basic;
        const tasks = this.state.stepData.tasks;

        return (
            <Wizard.Step.Content {...this.props}>
                <Header as='h4'>Action list</Header>
                <List ordered relaxed>
                    {
                        _.map(tasks, (task) =>
                            <List.Item key={task.name}>
                                {task.name}
                            </List.Item>
                        )
                    }
                </List>
            </Wizard.Step.Content>
        );
    }
}

export default Stage.Basic.Wizard.Utils.createWizardStep(confirmationStepId, 'Confirm', 'Confirm installation', ConfirmationStepContent, ConfirmationStepActions);