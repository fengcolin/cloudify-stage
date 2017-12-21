/**
 * Created by edenp on 17/12/2017.
 */

import { connect } from 'react-redux';
import AvailabilityField from '../components/basic/AvailabilityField';
import stageUtils from '../utils/stageUtils';
import consts from '../utils/consts';

const mapStateToProps = (state, ownProps) => {
    return {
        disallowGlobal: ownProps.disallowGlobal || !stageUtils.isUserAuthorized(consts.permissions.CREATE_GLOBAL_RESOURCE, state.manager)
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AvailabilityField);
