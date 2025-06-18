import BaseGame, { GameStatus } from './BaseGame';
import Card from './Card';
import type { GridSize } from './game';

export default class Game extends BaseGame {
	private images: string[] = ['bunny', 'dog', 'fox', 'mouse', 'owl', 'whale', 'alpaca', 'cat', 'chick', 'hedgehog', 'koala', 'panda', 'parrot', 'penguin', 'raccoon', 'shark', 'sloth', 'tiger'];

	public cards: Card[] = [];

	public isBusy: boolean = false;

	public flippedCards: Card[] = [];

	public difficulty: GridSize = 4;

	public attempts: number = 0;

	public bestScore: number = Infinity;

	private storageKeyPrefix = 'bestScore_';

	public constructor() {
		super();
	}

	public start(grid: HTMLDivElement, size: GridSize = 4) {
		this.difficulty = size;
		this.init(grid, size);
		this.attempts = 0;
		this.status = GameStatus.RUNNING;
		this.bestScore = this.getScore();
	}

	public init(grid: HTMLDivElement, size: GridSize) {
		const cardCount = size * size;
		this.getCards(cardCount);
		this.shuffleCards();
		this.renderGrid(grid, size);
		this.registerClickHandler(grid);
	}

	public renderGrid(grid: HTMLDivElement, size: GridSize) {
		grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
		this.cards.forEach((card) => {
			grid!.innerHTML += card.render();
		});
	}

	public registerClickHandler(grid: HTMLDivElement) {
		const handler = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			const cardElement = target?.closest('.card') as HTMLElement | null;
			const card = cardElement ? this.getCardByUuid(cardElement.id) : null;
			if (card) this.playCard(card);
		};
		grid.removeEventListener('click', handler);
		grid.addEventListener('click', handler);
	}

	public getCards(count: number) {
		const images = this.images.slice(0, count / 2);
		this.cards = images.flatMap((image: string, index: number) => {
			return [new Card(index, image), new Card(index, image)];
		});
	}

	public shuffleCards() {
		this.cards = this.cards.sort(() => Math.random() - 0.5);
	}

	public getCardByUuid(uuid: string) {
		return this.cards.find((card) => card.uuid === uuid);
	}

	public playCard(card: Card) {
		if (this.status !== GameStatus.RUNNING || this.isBusy || card.flipped || card.matched) return;

		card.flip();
		this.flippedCards.push(card);
		if (this.flippedCards.length === 2) {
			this.checkMatch();
			this.checkWin();
		}
	}

	public checkMatch() {
		this.isBusy = true;
		this.attempts++;
		this.fire('attempts:change', this.attempts);
		const [first, second] = this.flippedCards;
		this.flippedCards = [];
		if (first.match(second)) {
			this.isBusy = false;
		} else {
			setTimeout(() => {
				first.flip(false);
				second.flip(false);
				this.isBusy = false;
			}, 1000);
		}
	}

	public checkWin() {
		const win = !this.cards.some((card) => card.matched === false);
		if (win) {
			this.status = GameStatus.ENDED;
			if (this.attempts < this.bestScore) {
				this.saveScore(this.attempts);
			}
		}
	}

	// Save score with difficulty
	public saveScore(score: number): void {
		const difficulty = this.difficulty;
		const currentBest = this.getScore();
		if (currentBest === null || score < currentBest) {
			localStorage.setItem(this.storageKeyPrefix + difficulty, score.toString());
			this.bestScore = score;
		}
	}

	// Get score for a difficulty
	public getScore(): number {
		const difficulty = this.difficulty;
		const stored = localStorage.getItem(this.storageKeyPrefix + difficulty);
		return stored !== null ? parseInt(stored, 10) : Infinity;
	}
}
