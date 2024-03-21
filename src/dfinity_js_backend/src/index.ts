import { query, update, text, Record, StableBTreeMap, Variant, Vec, None, Some, Ok, Err, ic, Principal, Opt, nat64, Duration, Result, bool, Canister } from "azle";
import {
    Ledger, binaryAddressFromAddress, binaryAddressFromPrincipal, hexAddressFromPrincipal
} from "azle/canisters/ledger";
import { hashCode } from "hashcode";
import { v4 as uuidv4 } from "uuid";

/**
 * This type represents a product that can be listed on a marketplace.
 * It contains basic properties that are needed to define a product.
 */
const DataItem = Record({
    id: text,
    title: text,
    owner: Principal,
    description: text,
    price: nat64,
    seller: text,
    attachmentURL: text,
    dataFormat: text,
    status:text,
    quality:text,
    rating: nat64
});

const Purchaser = Record({
    id: text,
    name:text,
    price:nat64,
    message:text,
    purchasedItem:Vec(text)
});

const PurchaserPayload = Record({
    name:text,
    price:nat64,
    message:text,
});

const ReserveStatus = Variant({
    PaymentPending: text,
    Completed: text
});


const Reserve = Record({
    DataItemId: text,
    price: nat64,
    status: ReserveStatus,
    reservor: Principal,
    paid_at_block: Opt(nat64),
    memo: nat64
});


const DataItemPayload = Record({
    title: text,
    description: text,
    price: nat64,
    seller: text,
    attachmentURL: text,
    dataFormat: text,
    status:text,
    quality:text,
    rating: nat64
});

const Message = Variant({
    NotFound: text,
    InvalidPayload: text,
    PaymentFailed: text,
    PaymentCompleted: text
});

/**
 * `productsStorage` - it's a key-value datastructure that is used to store products by sellers.
 * {@link StableBTreeMap} is a self-balancing tree that acts as a durable data storage that keeps data across canister upgrades.
 * For the sake of this contract we've chosen {@link StableBTreeMap} as a storage for the next reasons:
 * - `insert`, `get` and `remove` operations have a constant time complexity - O(1)
 * - data stored in the map survives canister upgrades unlike using HashMap where data is stored in the heap and it's lost after the canister is upgraded
 * 
 * Brakedown of the `StableBTreeMap(text, Product)` datastructure:
 * - the key of map is a `productId`
 * - the value in this map is a product itself `Product` that is related to a given key (`productId`)
 * 
 * Constructor values:
 * 1) 0 - memory id where to initialize a map
 * 2) 16 - it's a max size of the key in bytes.
 * 3) 1024 - it's a max size of the value in bytes. 
 * 2 and 3 are not being used directly in the constructor but the Azle compiler utilizes these values during compile time
 */
const DataItemsStorage = StableBTreeMap(0, text, DataItem);
const purchasersStorage = StableBTreeMap(1, text , Purchaser)
const persistedBuy = StableBTreeMap(2, Principal, Reserve);
const pendingBuy = StableBTreeMap(3, nat64, Reserve);

const TIMEOUT_PERIOD = 3600n; // reservation period in seconds



/* 
    initialization of the Ledger canister. The principal text value is hardcoded because 
    we set it in the `dfx.json`
*/
const icpCanister = Ledger(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"));

export default Canister({

    getDataItems : query([], Vec(DataItem),  () => {
        return  DataItemsStorage.values();
    }
    ),

    getPurchasers : query([], Vec(Purchaser),  () => {
        return  purchasersStorage.values();
    }
    ),

    getDataItem: query([text], Result(DataItem, text), (id) => {
        const dataOpt = DataItemsStorage.get(id);
        if ("None" in dataOpt) {
            return Err("Data Item not found");
        }
        return Ok(dataOpt.Some);
    } 
    ),

    getPurchaser: query([text], Result(Purchaser, text), (name) => {
        const purchaserOpt = purchasersStorage.get(name);
        if ("None" in purchaserOpt) {
            return Err("Purchaser not found");
        }
        return Ok(purchaserOpt.Some);
    } 
    ),


    
    addDataItem: update([DataItemPayload], Result(DataItem, Message), (payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ NotFound: "invalid payoad" })
        }
        const data = { id: uuidv4(),owner: ic.caller(), ...payload };
        DataItemsStorage.insert(data.id, data);
        return Ok(data);
    }

    ),

    addPurchaser: update([PurchaserPayload], Result(Purchaser, Message), (payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ NotFound: "invalid payoad" })
        }
        const purchaser = { id: uuidv4(), ...payload , purchasedItem:[]};
        purchasersStorage.insert(purchaser.id, purchaser);
        return Ok(purchaser);
    }

    ),

    updateDataItem: update([text, DataItemPayload], Result(DataItem, Message), (id, payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ NotFound: "invalid payoad" })
        }
        const dataOpt = DataItemsStorage.get(id);
        if ("None" in dataOpt) {
            return Err({ NotFound: "Data not found" });
        }
        const data = dataOpt.Some;
        const updatedData = { ...data, ...payload };
        DataItemsStorage.insert(id, updatedData);
        return Ok(updatedData);
    }),

    updatePurchaser: update([text, PurchaserPayload], Result(Purchaser, Message), (id, payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ NotFound: "invalid payoad" })
        }
        const purchaserOpt = purchasersStorage.get(id);
        if ("None" in purchaserOpt) {
            return Err({ NotFound: "Purchaser not found" });
        }
        const purchaser = purchaserOpt.Some;
        const updatedPurchaser = { ...purchaser, ...payload };
        purchasersStorage.insert(id, updatedPurchaser);
        return Ok(updatedPurchaser);
    }),


    deleteDataItem: update([text], Result(text, Message), (id) => {
        const deletedDataItemOpt = DataItemsStorage.remove(id);
        if ("None" in deletedDataItemOpt) {
            return Err({ NotFound: `cannot delete the DataItem: DataItem with id=${id} not found` });
        }
        return Ok(deletedDataItemOpt.Some.id);
    }),

    deletePurchaser: update([text], Result(text, Message), (id) => {
        const deletedPurchaserOpt = purchasersStorage.remove(id);
        if ("None" in deletedPurchaserOpt) {
            return Err({ NotFound: `cannot delete the Purchaser: Purchaser with id=${id} not found` });
        }
        return Ok(deletedPurchaserOpt.Some.id);
    }),

    addPurchasedItem: update([text,text], Result(text, Message), (purchaserId,itemId) => {
        const purchaserOpt = purchasersStorage.get(purchaserId);
        if ("None" in purchaserOpt) {
            return Err({ NotFound: "Purchaser not found" });
        }
        const purchaser = purchaserOpt.Some;
        purchaser.purchasedItem.push(itemId);
        purchasersStorage.insert(purchaserId, purchaser);
        return Ok("Item added to Purchaser");
    } 

    ),

    searchDataItem: query([text], Vec(DataItem), (query) => {
        const datas = DataItemsStorage.values();
        return datas.filter(datum => datum.title.toLowerCase().includes(query.toLowerCase()) || datum.description.toLowerCase().includes(query.toLowerCase()));
    }),

    // filter by data format
    filterDataItem: query([text], Vec(DataItem), (query) => {
        const datas = DataItemsStorage.values();
        return datas.filter(datum => datum.dataFormat.toLowerCase().includes(query.toLowerCase()));
    }),

    getInitialDataItem: query([], Vec(DataItem), () => {
        const datas = DataItemsStorage.values();
        return datas.slice(0, 2);
    }
    ),

     // Load More Data Items
    getMoreDataItems: query([nat64,nat64], Vec(DataItem), (start, limit) => {
        const datas = DataItemsStorage.values();
        return datas.slice(Number(start),Number(start + limit));
    }),

    createBuy: update([text], Result(Reserve, Message), (dataItemId) => {
        const dataOpt = DataItemsStorage.get(dataItemId);
        if ("None" in dataOpt) {
            return Err({ NotFound: `cannot reserve Data Item: Data Item with id=${dataItemId} not found` });
        }
        const data = dataOpt.Some;
        const reserve = {
            DataItemId: data.id,
            price: data.price,
            status: { PaymentPending: "PAYMENT_PENDING" },
            reservor: data.owner,
            paid_at_block: None,
            memo: generateCorrelationId(dataItemId)
        };
        pendingBuy.insert(reserve.memo, reserve);
        discardByTimeout(reserve.memo, TIMEOUT_PERIOD);
        return Ok(reserve);
    }
    ),

    completeBuy: update([Principal,text,nat64, nat64, nat64], Result(Reserve, Message), async (reservor,dataItemId,buyPrice, block, memo) => {
        const paymentVerified = await verifyPaymentInternal(reservor,buyPrice, block, memo);
        if (!paymentVerified) {
            return Err({ NotFound: `cannot complete the reserve: cannot verify the payment, memo=${memo}` });
        }
        const pendingBuyOpt = pendingBuy.remove(memo);
        if ("None" in pendingBuyOpt) {
            return Err({ NotFound: `cannot complete the reserve: there is no pending reserve with id=${dataItemId}` });
        }
        const buy = pendingBuyOpt.Some;
        const updatedBuy = { ...buy, status: { Completed: "COMPLETED" }, paid_at_block: Some(block) };
        const dataItemOpt = DataItemsStorage.get(dataItemId);
        if ("None" in dataItemOpt){
            throw Error(`Data Item with id=${dataItemId} not found`)
        }
        const dataItem = dataItemOpt.Some;
        dataItem.status = "Sold";
        DataItemsStorage.insert(dataItem.id,dataItem)
        persistedBuy.insert(ic.caller(), updatedBuy);
        return Ok(updatedBuy);

    }
    ),

    verifyPayment: query([Principal, nat64, nat64, nat64], bool, async (receiver, amount, block, memo) => {
        return await verifyPaymentInternal(receiver, amount, block, memo);
    }),

    /*
        a helper function to get address from the principal
        the address is later used in the transfer method
    */
    getAddressFromPrincipal: query([Principal], text, (principal) => {
        return hexAddressFromPrincipal(principal, 0);
    }),


});

/*
    a hash function that is used to generate correlation ids for orders.
    also, we use that in the verifyPayment function where we check if the used has actually paid the order
*/
function hash(input: any): nat64 {
    return BigInt(Math.abs(hashCode().value(input)));
};

// a workaround to make uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};


// HELPER FUNCTIONS
function generateCorrelationId(dataItemId: text): nat64 {
    const correlationId = `${dataItemId}_${ic.caller().toText()}_${ic.time()}`;
    return hash(correlationId);
};

/*
    after the order is created, we give the `delay` amount of minutes to pay for the order.
    if it's not paid during this timeframe, the order is automatically removed from the pending orders.
*/
function discardByTimeout(memo: nat64, delay: Duration) {
    ic.setTimer(delay, () => {
        const order = pendingBuy.remove(memo);
        console.log(`Reserve discarded ${order}`);
    });
};

async function verifyPaymentInternal(receiver: Principal, amount: nat64, block: nat64, memo: nat64): Promise<bool> {
    const blockData = await ic.call(icpCanister.query_blocks, { args: [{ start: block, length: 1n }] });
    const tx = blockData.blocks.find((block) => {
        if ("None" in block.transaction.operation) {
            return false;
        }
        const operation = block.transaction.operation.Some;
        const senderAddress = binaryAddressFromPrincipal(ic.caller(), 0);
        const receiverAddress = binaryAddressFromPrincipal(receiver, 0);
        return block.transaction.memo === memo &&
            hash(senderAddress) === hash(operation.Transfer?.from) &&
            hash(receiverAddress) === hash(operation.Transfer?.to) &&
            amount === operation.Transfer?.amount.e8s;
    });
    return tx ? true : false;
};

