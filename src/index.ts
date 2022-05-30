import "./styles/index.scss";
import Game from "./game/";

const container: HTMLElement = document.querySelector(".container")!;
const game = new Game(container);
game.run();