import { GameStatus } from './game/BaseGame';
import type { GridSize } from './game/game';
import Game from './game/Game';
import './styles/main.css';

const transition = (cb: () => void | Promise<void>): Promise<void> => {
	if (document.startViewTransition) {
		// startViewTransition retourne un ViewTransition, on attend sa Promise finished
		return document.startViewTransition(cb).finished;
	} else {
		// fallback synchrone + Promise résolue
		return Promise.resolve(cb());
	}
};

const renderHome = async () => {
	await transition(() => {
		document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
		<div class="gui-container">
			<img class="logo" src="/assets/logo.png" alt="Game logo">
			<button class="play-btn"></button>
		</div>
		`;
	});
	document.querySelector('.play-btn')?.addEventListener('click', renderDifficulty);
};

const renderDifficulty = async () => {
	await transition(() => {
		document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
		<div class="gui-container difficulty">
			<h1>Choose your difficulty</h1>
			<button data-size="2">2 x 2</button>
			<button data-size="4">4 x 4</button>
			<button data-size="6">6 x 6</button>
		</div>
		`;
	});

	// Récupère tous les boutons
	const buttons = document.querySelectorAll<HTMLButtonElement>('.gui-container.difficulty button');

	buttons.forEach((button) => {
		button.addEventListener('click', async () => {
			const size = parseInt(button.dataset.size!) as GridSize; // récupère la difficulté (2,4,6)
			const board = await renderBoard();
			game.start(board, size);
		});
	});
};

const renderBoard = async () => {
	await transition(() => {
		document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
		<div id="attempts">0</div>
		<div id="board"></div>
		`;
	});
	return document.querySelector<HTMLDivElement>('#board')!;
};

const renderEnd = async () => {
	await transition(() => {
		document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
		<div class="gui-container">
			<img class="logo" src="/assets/win.png" alt="Game logo">
			<p class="final-score">
				You did it in ${game.attempts} attempts ! <br>
				${game.attempts < Infinity ? 'Your best score is ' + game.bestScore : ''}
			</p>
			<button class="replay-btn"></button>
		</div>
		`;
	});
	document.querySelector('.replay-btn')?.addEventListener('click', renderHome);
};

const game = new Game();
renderHome();

game.on('status:change', (status: GameStatus) => {
	if (status === GameStatus.ENDED) {
		setTimeout(renderEnd, 1500);
	}
});

game.on('attempts:change', (score: number) => {
	const el = document.querySelector('#attempts');
	if (el) {
		el.innerHTML = score.toString();
	}
});
