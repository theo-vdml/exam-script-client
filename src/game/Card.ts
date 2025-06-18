export default class Card {
	/** A unique id for each card */
	public uuid: string;

	/** An id shared by two card */
	public pairId: number;

	/** The image used for the card */
	public image: string;

	/** Whether the card is currently visible  */
	public flipped: boolean = false;

	/** Whether the card has already been matched with its pair. */
	public matched: boolean = false;

	/**
	 * Create a new Card instance
	 *
	 * @param pairId the card pairId (shared with pair)
	 * @param image (the image for the card)
	 */
	public constructor(pairId: number, image: string) {
		this.uuid = crypto.randomUUID();
		this.pairId = pairId;
		this.image = image;
	}

	/**
	 * Flip the card face-up face-down
	 *
	 * @param state Force a state
	 */
	public flip(state: boolean | null = null) {
		this.flipped = typeof state === 'boolean' ? state : true;
		this.updateCardClasses();
	}

	/**
	 * Compare another card with itself, and perform match logic
	 *
	 * @param otherCard The card to compare with
	 * @returns Whether the card matched or not
	 */
	public match(otherCard: Card) {
		if (otherCard.pairId != this.pairId) return false;

		this.matched = true;
		otherCard.matched = true;
		this.updateCardClasses();
		otherCard.updateCardClasses();
		return true;
	}

	/**
	 * Generates the HTML representation of the card.
	 *
	 * @returns A string of HTML representing the card's current state.
	 */
	public render() {
		return `
            <div id="${this.uuid}" class="card">
                <div class="card-inner">
                    <div class="card-front"><img src="assets/animals/${this.image}.jpeg" alt="${this.image}"></div>
                    <div class="card-back"><img src="assets/animals/back.jpeg" alt="${this.image}'s back"></div>
                </div>
            </div>
        `;
	}

	public updateCardClasses() {
		const card = document.getElementById(this.uuid);
		if (card) {
			card.classList.toggle('flipped', this.flipped);
			card.classList.toggle('matched', this.matched);
		}
	}
}
