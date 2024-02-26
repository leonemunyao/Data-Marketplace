import { Principal } from "@dfinity/principal";
import { transferICP } from "./ledger";

export async function createItem(item) {
  return window.canister.dataMarketplace.addDataItem(item);
}

export async function getItem() {
  try {
    return await window.canister.dataMarketplace.getDataItem();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}

export async function getItems() {
  try {
    return await window.canister.dataMarketplace.getDataItems();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

export async function getInitialDataItem() {
  try {
    return await window.canister.dataMarketplace.getInitialDataItem();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

export async function getMoreDataItems(start, limit) {
  try {
    return await window.canister.dataMarketplace.getMoreDataItems(start, limit);
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

export async function filterDataItems(filter) {
  try {
    return await window.canister.dataMarketplace.filterDataItems(filter);
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

export async function updateDataItem(id, item) {
  return window.canister.dataMarketplace.updateDataItem(id, item);
}

export async function deleteDataItem(id) {
  return window.canister.dataMarketplace.deleteDataItem(id);
}

export async function searchDataItem(query) {
  return window.canister.dataMarketplace.searchDataItem(query);
}


export async function createPurchaser(purchaser){
  return window.canister.dataMarketplace.addPurchaser(purchaser);
}

export async function getPurchaser() {
  try {
    return await window.canister.dataMarketplace.getPurchaser();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return {};
  }
}

export async function getPurchasers() {
  try {
    return await window.canister.dataMarketplace.getPurchasers();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

export async function updatePurchaser(id, purchaser) {
  return window.canister.dataMarketplace.updatePurchaser(id, purchaser);
}

export async function deletePurchaser(id) {
  return window.canister.dataMarketplace.deletePurchaser(id);
}

export async function addPurchasedItem(purchaserId, itemId){
  return window.canister.dataMarketplace.addPurchasedItem(purchaserId, itemId);
}




