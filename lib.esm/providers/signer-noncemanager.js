import { defineProperties } from "../utils/index.js";
import { AbstractSigner } from "./abstract-signer.js";
export class NonceManager extends AbstractSigner {
    signer;
    #noncePromise;
    #delta;
    constructor(signer) {
        super(signer.provider);
        defineProperties(this, { signer });
        this.#noncePromise = null;
        this.#delta = 0;
    }
    async getAddress() {
        return this.signer.getAddress();
    }
    connect(provider) {
        return new NonceManager(this.signer.connect(provider));
    }
    async getNonce(blockTag) {
        if (blockTag === "pending") {
            if (this.#noncePromise == null) {
                this.#noncePromise = super.getNonce("pending");
            }
            return (await this.#noncePromise) + this.#delta;
        }
        return super.getNonce(blockTag);
    }
    increment() {
        this.#delta++;
    }
    reset() {
        this.#delta = 0;
        this.#noncePromise = null;
    }
    async sendTransaction(tx) {
        const noncePromise = this.getNonce("pending");
        this.increment();
        tx = await this.signer.populateTransaction(tx);
        tx.nonce = await noncePromise;
        // @TODO: Maybe handle interesting/recoverable errors?
        // Like don't increment if the tx was certainly not sent
        return await this.signer.sendTransaction(tx);
    }
    signTransaction(tx) {
        return this.signer.signTransaction(tx);
    }
    signMessage(message) {
        return this.signer.signMessage(message);
    }
    signTypedData(domain, types, value) {
        return this.signer.signTypedData(domain, types, value);
    }
}
//# sourceMappingURL=signer-noncemanager.js.map