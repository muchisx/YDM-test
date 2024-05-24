// @ts-check

/** @type {object} */
// @ts-ignore
const PUB_SUB_EVENTS_TYPED = PUB_SUB_EVENTS;

/** @type {function(string, any): void} */
// @ts-ignore
const publish_typed = window.publish;

/** @type {object} */
// @ts-ignore
const Shopify_typed = window.Shopify;

if (!PUB_SUB_EVENTS_TYPED || !publish_typed || !Shopify_typed) {
  console.error("Missing dependencies");
}

class UpgradeAddToCart extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("click", this.onAddToCartClick);
  }

  async onAddToCartClick() {
    const currentVariantId = this.dataset.currentVariantId;
    const currentProductQuantity = parseInt(this.dataset.currentVariantQuantity || "1", 10);
    const upgradeVariantId = this.dataset.upgradeVariantId;
    const upgradeQuantity = parseInt(this.dataset.upgradeVariantQuantity || "0", 10);

    try {
      if (upgradeVariantId && currentVariantId) {
        await this.updateCart(upgradeVariantId, upgradeQuantity, currentProductQuantity, currentVariantId);
      }

      publish_typed(PUB_SUB_EVENTS_TYPED.cartUpdate, { source: "upgrade_drawer" });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @param {string} upgradeVariantId
   * @param {number} upgradeQuantity
   * @param {number} currentProductQuantity
   * @param {string} currentVariantId
   */
  async updateCart(upgradeVariantId, upgradeQuantity, currentProductQuantity, currentVariantId) {
    const updates = {
      [upgradeVariantId]: upgradeQuantity + 1,
      [currentVariantId]: currentProductQuantity - 1,
    };

    await fetch(Shopify_typed.routes.root + "cart/update.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates }),
    });
  }
}
customElements.define("upgrade-add-to-cart", UpgradeAddToCart);
