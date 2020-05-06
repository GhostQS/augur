import { compose } from "redux";

import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import App from "modules/app/components/app";
import { sendFinalizeMarket } from "modules/markets/actions/finalize-market";
import { selectInfoAlertsAndSeenCount } from "modules/alerts/selectors/alerts";
import { selectNotifications } from "modules/notifications/selectors/notification-state";
import { initAugur } from "modules/app/actions/init-augur";
import { RewriteUrlParams } from "modules/app/hocs/rewrite-url-params";
import { windowRef } from "utils/window-ref";
import isGlobalWeb3 from "modules/auth/helpers/is-global-web3";
import { logout } from "modules/auth/actions/logout";
import { updateSelectedCategories } from "modules/markets-list/actions/update-markets-list";
import { MODAL_GLOBAL_CHAT, MODAL_MIGRATE_REP, WALLET_STATUS_VALUES, TRANSACTIONS, MIGRATE_FROM_LEG_REP_TOKEN } from 'modules/common/constants';
import { createFundedGsnWallet } from "modules/auth/actions/update-sdk";
import { AppState } from "appStore";
import { AppStatus } from 'modules/app/store/app-status';
import isAddress from "modules/auth/helpers/is-address";

const mapStateToProps = (state: AppState) => {
  const { pendingQueue } = state;
  const { universe, walletStatus, modal, loginAccount: { balances } } = AppStatus.get();
  const { alerts } = selectInfoAlertsAndSeenCount(state);
  const notifications = selectNotifications(state);
  const walletBalances = balances;
  const pending =
    pendingQueue[TRANSACTIONS] &&
    pendingQueue[TRANSACTIONS][MIGRATE_FROM_LEG_REP_TOKEN];
  const showCreateAccountButton =
    walletStatus === WALLET_STATUS_VALUES.WAITING_FOR_FUNDING ||
    walletStatus === WALLET_STATUS_VALUES.FUNDED_NEED_CREATE;
  const showMigrateRepButton =
    !!balances.legacyRep || !!balances.legacyRepNonSafe || !!pending;

  return {
    notifications,
    modal,
    toasts: alerts.filter(alert => alert.toast && !alert.seen),
    universe,
    useWeb3Transport: isGlobalWeb3(),
    walletBalances,
    showCreateAccountButton,
    showMigrateRepButton,
  }
};

const mapDispatchToProps = dispatch => {
  const { setModal, updateLoginAccount } = AppStatus.actions;
  return ({
    initAugur: (history, overrides, cb) =>
      dispatch(initAugur(history, overrides, cb)),
    updateModal: modal => setModal(modal),
    finalizeMarket: marketId => dispatch(sendFinalizeMarket(marketId)),
    logout: () => dispatch(logout()),
    updateSelectedCategories: (category) => dispatch(updateSelectedCategories(category)),
    showGlobalChat: () => setModal({ type: MODAL_GLOBAL_CHAT }),
    migrateV1Rep: () => setModal({ type: MODAL_MIGRATE_REP }),
    saveAffilateAddress: affiliate => isAddress(affiliate) ? updateLoginAccount({ affiliate }) : null,
    createFundedGsnWallet: () => dispatch(createFundedGsnWallet()),
  });
}
const AppContainer = compose(
  withRouter,
  RewriteUrlParams(windowRef),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(App);

export default AppContainer;
