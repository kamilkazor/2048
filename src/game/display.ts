import "../styles/game.scss";
import { getTileBackgroundColor, getTileTextColor } from "./tileTheme";

enum ActionType {
  ADD_TILE,
  MOVE_TILE,
  UPGRADE_TILE,
  REMOVE_TILE,
  ANIMATE_BOARD,
  UPDATE_BEST_SCORE,
  UPDATE_SCORE
}

interface AddTileInterface {
  type: ActionType.ADD_TILE;
  payload: {
    tileID: string;
    tileValue: number;
    column: number;
    row: number;
  }
}
interface MoveTileInterface {
  type: ActionType.MOVE_TILE;
  payload: {
    tileID: string;
    column: number;
    row: number;
  }
}
interface UpgradeTileInterface {
  type: ActionType.UPGRADE_TILE;
  payload: {
    tileID: string;
    newValue: number;
  }
}
interface RemoveTileInterface {
  type: ActionType.REMOVE_TILE;
  payload: {
    tileID: string;
  }
}
interface AnimateBoardInterface {
  type: ActionType.ANIMATE_BOARD;
  payload: {
    dirrection: "RIGHT"|"LEFT"|"TOP"|"BOTTOM"
  }
}
interface UpdateScoreInterface {
  type: ActionType.UPDATE_SCORE;
  payload: {
    newScore: number;
    amount: null|number;
  }
}
interface UpdateBestScoreInterface {
  type: ActionType.UPDATE_BEST_SCORE;
  payload: {
    newScore: number;
    wait: boolean;
  }
}

type Action = 
  AddTileInterface | 
  MoveTileInterface | 
  UpgradeTileInterface | 
  RemoveTileInterface |
  AnimateBoardInterface|
  UpdateScoreInterface|
  UpdateBestScoreInterface;


class Display {
  private rows: number;
  private columns: number;
  private animationTime: number;
  private toUpdate: Action[];

  private container: HTMLElement;
  private game: HTMLDivElement;

  private starsSmall: HTMLDivElement;
  private starsSmallAfter: HTMLDivElement;
  private starsMedium: HTMLDivElement;
  private starsMediumAfter: HTMLDivElement;
  private starsLarge: HTMLDivElement;
  private starsLargeAfter: HTMLDivElement;

  private box: HTMLDivElement;
  private boardWrapper: HTMLDivElement;
  readonly board: HTMLDivElement;
  private header: HTMLDivElement;

  private scores: HTMLDivElement;
  private bestScore: HTMLDivElement;
  private bestScoreLabel: HTMLDivElement;
  private bestScoreValue: HTMLDivElement;
  private score: HTMLDivElement;
  private scoreLabel: HTMLDivElement;
  private scoreValue: HTMLDivElement;

  private newGameHandler: any;
  private continueAfterWinHandler: any;
  private newGameButton: HTMLDivElement;
  private newGameButtonHandler: any;
  private closeNotification: null|Function;

  constructor(
    container: HTMLElement,
    newGameHandler: Function,
    continueAfterWinHandler: Function,
    gameScope: Object,
    ) {
    this.rows = 0;
    this.columns = 0;
    this.animationTime = 200;
    this.toUpdate = [];

    this.newGameHandler = newGameHandler.bind(gameScope);
    this.continueAfterWinHandler = continueAfterWinHandler.bind(gameScope);
    this.closeNotification = null;

    this.container = container;

    this.game = document.createElement("div");
    this.game.classList.add("game");
    this.game.style.setProperty("--animation-time", `${this.animationTime}ms`);
    this.container.appendChild(this.game);
    
    this.starsSmall = document.createElement("div");
    this.starsSmall.classList.add("game__stars", "game__stars--small")
    this.starsSmallAfter = document.createElement("div");
    this.starsSmallAfter.classList.add("game__stars", "game__stars--small", "game__stars--after");
    this.game.appendChild(this.starsSmall);
    this.game.appendChild(this.starsSmallAfter);
    this.starsMedium = document.createElement("div");
    this.starsMedium.classList.add("game__stars", "game__stars--medium")
    this.starsMediumAfter = document.createElement("div");
    this.starsMediumAfter.classList.add("game__stars", "game__stars--medium", "game__stars--after");
    this.game.appendChild(this.starsMedium);
    this.game.appendChild(this.starsMediumAfter);
    this.starsLarge = document.createElement("div");
    this.starsLarge.classList.add("game__stars", "game__stars--large")
    this.starsLargeAfter = document.createElement("div");
    this.starsLargeAfter.classList.add("game__stars", "game__stars--large", "game__stars--after");
    this.game.appendChild(this.starsLarge);
    this.game.appendChild(this.starsLargeAfter);
   
    this.box = document.createElement("div");
    this.box.classList.add("game__box");
    this.game.appendChild(this.box);
    
    this.header = document.createElement("div");
    this.header.classList.add("game__header");
    this.box.appendChild(this.header);
    
    this.scores = document.createElement("div");
    this.scores.classList.add("game__scores");
    this.header.appendChild(this.scores);
    this.bestScore = document.createElement("div");
    this.bestScore.classList.add("game__score", "game__score--best");
    this.bestScoreLabel = document.createElement("div");
    this.bestScoreLabel.classList.add("game__scoreLabel");
    this.bestScoreLabel.innerText = "BEST: ";
    this.bestScoreValue = document.createElement("div");
    this.bestScoreValue.classList.add("game__scoreValue");
    this.bestScoreValue.innerText = "0";
    this.bestScore.appendChild(this.bestScoreLabel);
    this.bestScore.appendChild(this.bestScoreValue);
    this.scores.appendChild(this.bestScore); 
    this.score = document.createElement("div");
    this.score.classList.add("game__score");
    this.scoreLabel = document.createElement("div");
    this.scoreLabel.classList.add("game__scoreLabel");
    this.scoreLabel.innerText = "SCORE: ";
    this.scoreValue = document.createElement("div");
    this.scoreValue.classList.add("game__scoreValue");
    this.scoreValue.innerText = "0";
    this.score.appendChild(this.scoreLabel);
    this.score.appendChild(this.scoreValue);
    this.scores.appendChild(this.score);
    
    this.newGameButton = document.createElement("div");
    this.newGameButton.classList.add("game__headerButton");
    this.newGameButton.innerText = "-NEW GAME";
    this.newGameButtonHandler = (event: MouseEvent) => {
      if(this.closeNotification) {
        this.closeNotification();
      }
      this.playAnimationOnce(this.newGameButton, "game__headerButton--click");
      this.newGameHandler();
    }
    this.newGameButton.addEventListener("click", this.newGameButtonHandler);
    this.header.appendChild(this.newGameButton);
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if(event.code == "KeyN") {
        this.newGameButtonHandler();
      }
    })
    
    this.boardWrapper = document.createElement("div");
    this.boardWrapper.classList.add("game__boardWrapper");
    this.box.appendChild(this.boardWrapper);

    this.board = document.createElement("div");
    this.board.classList.add("game__board");
    this.boardWrapper.appendChild(this.board);
    this.drawNewBoard(this.rows, this.columns);

    setTimeout(() => {this.drawNewStars();}, 10)
    window.addEventListener("resize", () => {this.drawNewStars();});
  }

  update() {
    const runningActions: Promise<void>[] = [];
    while(this.toUpdate.length > 0) {
      const action = this.toUpdate.shift()!;
      switch(action.type) {
        case ActionType.ADD_TILE:
          runningActions.push(this.addTileLogic(action.payload));
          break;
        case ActionType.MOVE_TILE:
          runningActions.push(this.moveTileLogic(action.payload));
          break;
        case ActionType.UPGRADE_TILE:
          runningActions.push(this.upgradeTileLogic(action.payload));
          break;
        case ActionType.REMOVE_TILE:
          runningActions.push(this.removeTileLogic(action.payload));
          break;
        case ActionType.ANIMATE_BOARD:
          runningActions.push(this.animateBoardLogic(action.payload));
          break;
        case ActionType.UPDATE_SCORE:
          runningActions.push(this.updateScoreLogic(action.payload));
          break;
        case ActionType.UPDATE_BEST_SCORE:
          runningActions.push(this.updateBestScoreLogic(action.payload));
          break;
        default:
          break;
      }
    }
    return Promise.all(runningActions);
  }

  drawNewBoard(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.board.innerHTML = "";
    this.game.style.setProperty("--rows", this.rows.toString());
    this.game.style.setProperty("--columns", this.columns.toString());
    for(let row = 0; row < this.rows; row++) {
      for(let column = 0; column < this.columns; column++) {
        const cell = document.createElement("div");
        cell.classList.add("game__cell");
        this.board.appendChild(cell);
      }
    }
  }

  private playAnimationOnce(element: HTMLElement, animationClass: string, callback?: Function) {
    element.classList.add(animationClass);
    const eventHandler = (event: AnimationEvent) => {
      event.stopPropagation();
      element.classList.remove(animationClass);
      element.removeEventListener("animationcancel", eventHandler);
      element.removeEventListener("animationend", eventHandler);
      if(callback) {
        callback();
      }
    }
    element.addEventListener("animationcancel", eventHandler);
    element.addEventListener("animationend", eventHandler);
  }

  private addTileLogic(payload: AddTileInterface["payload"]) {
    return new Promise<void>((resolve) => {
      const tile = document.createElement("div");
      tile.id = payload.tileID;
      tile.classList.add("game__tile");
      tile.style.setProperty("--row", payload.row.toString());
      tile.style.setProperty("--column", payload.column.toString());
      tile.style.setProperty("--tile-background-color", getTileBackgroundColor(payload.tileValue));
      tile.style.setProperty("--tile-text-color", getTileTextColor(payload.tileValue));
      const tileValue = document.createElement("div");
      tileValue.classList.add("game__tileValue");
      tileValue.innerText = payload.tileValue.toString();
      tile.appendChild(tileValue);
      this.playAnimationOnce(tile, "game__tile--appear", resolve);
      this.board.appendChild(tile);
    })
  }
  addTile(tileID: string, tileValue: number, row: number, column: number) {
    const action: AddTileInterface = {
      type: ActionType.ADD_TILE,
      payload: {
        tileID,
        tileValue,
        row,
        column
      }
    }
    this.toUpdate.push(action);
  }

  private moveTileLogic(payload: MoveTileInterface["payload"]) {
    return new Promise<void>((resolve) => {
      const tile: HTMLDivElement = this.board.querySelector(`#${payload.tileID}`)!;
      tile.style.setProperty("--row", payload.row.toString());
      tile.style.setProperty("--column", payload.column.toString());

      const eventHandler = (event: TransitionEvent) => {
        event.stopPropagation;
        tile.removeEventListener("transitioncancel", eventHandler);
        tile.removeEventListener("transitionend", eventHandler);
        resolve();
      }
      tile.addEventListener("transitioncancel", eventHandler);
      tile.addEventListener("transitionend", eventHandler);
    })
  }
  moveTile(tileID: string, row: number, column: number) {
    const action: MoveTileInterface = {
      type: ActionType.MOVE_TILE,
      payload: {
        tileID,
        row,
        column
      }
    }
    this.toUpdate.push(action);
  }

  private upgradeTileLogic(payload: UpgradeTileInterface["payload"]) {
    return new Promise<void>((resolve) => {
      const tile: HTMLDivElement = this.board.querySelector(`#${payload.tileID}`)!;
      const tileValue: HTMLDivElement = tile.querySelector(".game__tileValue")!;
      setTimeout( () => {
        tileValue.innerText = payload.newValue.toString();
        tile.style.setProperty("--tile-background-color", getTileBackgroundColor(payload.newValue));
        tile.style.setProperty("--tile-text-color", getTileTextColor(payload.newValue));
      }, this.animationTime);
      this.playAnimationOnce(tileValue, "game__tileValue--upgrade");
      this.playAnimationOnce(tile, "game__tile--upgrade", resolve);
    })
  }
  upgradeTile(tileID: string, newValue: number) {
    const action: UpgradeTileInterface = {
      type: ActionType.UPGRADE_TILE,
      payload: {
        tileID,
        newValue
      }
    }
    this.toUpdate.push(action);
  }

  private removeTileLogic(payload: RemoveTileInterface["payload"]) {
    return new Promise<void>((resolve) => {
      const tile: HTMLDivElement = this.board.querySelector(`#${payload.tileID}`)!;
      const tileValue: HTMLDivElement = tile.querySelector(".game__tileValue")!;
      const callback = () => {
        tile.remove()
        resolve()
      }
      this.playAnimationOnce(tileValue, "game__tileValue--remove");
      this.playAnimationOnce(tile, "game__tile--remove", callback);
    })
  }
  removeTile(tileID: string) {
    const action: RemoveTileInterface = {
      type: ActionType.REMOVE_TILE,
      payload: {
        tileID
      }
    }
    this.toUpdate.push(action);
  }

  private animateBoardLogic(payload: AnimateBoardInterface["payload"]) {
    return new Promise<void>((resolve) => {
      switch(payload.dirrection) {
        case "RIGHT":
          this.playAnimationOnce(this.board, "game__board--right", resolve);
          break;
        case "LEFT":
          this.playAnimationOnce(this.board, "game__board--left", resolve);
          break;
        case "TOP":
          this.playAnimationOnce(this.board, "game__board--top", resolve);
          break;
        case "BOTTOM":
          this.playAnimationOnce(this.board, "game__board--bottom", resolve);
          break;
        default:
          break;
      }
    })
  }
  animateBoard(dirrection: "RIGHT"|"LEFT"|"TOP"|"BOTTOM") {
    const action: AnimateBoardInterface = {
      type: ActionType.ANIMATE_BOARD,
      payload: {
        dirrection
      }
    }
    this.toUpdate.push(action);
  }

  private updateScoreLogic(payload: UpdateScoreInterface["payload"]) {
    return new Promise<void>((resolve) => {
      if(payload.amount) {
        const scoreAmount = document.createElement("div");
        scoreAmount.innerText = `+${payload.amount}`;
        scoreAmount.classList.add("game__scoreAmount");
        const xDistance = Math.random();
        const yDistance = Math.random();
        const xDirrection = Math.random() < 0.5 ? -1 : 1;
        const yDirrection = Math.random() < 0.5 ? -1 : 1;
        scoreAmount.style.setProperty("--xDistance", xDistance.toString());
        scoreAmount.style.setProperty("--yDistance", yDistance.toString());
        scoreAmount.style.setProperty("--xDirrection", xDirrection.toString());
        scoreAmount.style.setProperty("--yDirrection", yDirrection.toString());
        this.score.appendChild(scoreAmount);
        setTimeout(() => {
          this.playAnimationOnce(this.scoreValue, "game__scoreValue--add");
          this.scoreValue.innerText = payload.newScore.toString();
        }, this.animationTime * 2);
        this.playAnimationOnce(scoreAmount, "game__scoreAmount--add", () => {scoreAmount.remove()})
      }
      else {
        this.scoreValue.innerText = payload.newScore.toString();
      }
      resolve()
    })
  }
  updateScore(newScore: number, amount: null|number = null) {
    const action: UpdateScoreInterface = {
      type: ActionType.UPDATE_SCORE,
      payload: {
        newScore,
        amount
      }
    }
    this.toUpdate.push(action);
  }

  private updateBestScoreLogic(payload: UpdateBestScoreInterface["payload"]) {
    return new Promise<void>((resolve) => {
      if(payload.wait) {
        setTimeout(() => {
          this.bestScoreValue.innerText = payload.newScore.toString();
        }, this.animationTime * 2);
      }
      else {
        this.bestScoreValue.innerText = payload.newScore.toString();
      }
      resolve()
    })
  }
  updateBestScore(newScore: number, wait: boolean = false) {
    const action: UpdateBestScoreInterface = {
      type: ActionType.UPDATE_BEST_SCORE,
      payload: {
        newScore,
        wait
      }
    }
    this.toUpdate.push(action);
  }

  gameOverNotification() {
    return new Promise<void>((resolve) => {
      const notification = document.createElement("div");
      notification.classList.add("game__notification");
      this.playAnimationOnce(notification, "game__notification--appear");
      this.board.classList.add("game__board--notification");

      const closeNotification = () => {
        document.removeEventListener("keydown", keyDonwHandler);
        this.board.classList.remove("game__board--notification");
        this.playAnimationOnce(notification, "game__notification--remove", () => {
          notification.remove()
          resolve();
        });
      }
      this.closeNotification = closeNotification;
 
      const title = document.createElement("h1");
      title.classList.add("game__notificationTitle");
      title.innerText = "GAME OVER";
      notification.appendChild(title);

      const tryAgainHandler = () => {
        this.newGameHandler();
        if(this.closeNotification) {
          this.closeNotification();
        }
      }
      const tryAgainButton = document.createElement("div");
      tryAgainButton.classList.add("game__notificationButton");
      tryAgainButton.innerText = "TRY AGAIN";
      tryAgainButton.addEventListener("click", tryAgainHandler);
      notification.appendChild(tryAgainButton);

      const keyDonwHandler = (event: KeyboardEvent) => {
        event.preventDefault();
        switch(event.code) {
          case "Enter":
            tryAgainHandler();
            break;
          default:
            break;
        }
      }
      document.addEventListener("keydown", keyDonwHandler );
      
      this.boardWrapper.appendChild(notification);
    })
  }

  winNotification() {
    return new Promise<void>((resolve) => {
      const notification = document.createElement("div");
      notification.classList.add("game__notification", "game__notification--appear");
      this.board.classList.add("game__board--notification");

      const closeNotification = () => {
        document.removeEventListener("keydown", keyDonwHandler);
        this.board.classList.remove("game__board--notification");
        this.playAnimationOnce(notification, "game__notification--remove", () => {
          notification.remove()
          resolve();
        });
      }
      this.closeNotification = closeNotification;
      
      const title = document.createElement("h1");
      title.classList.add("game__notificationTitle");
      title.innerText = "YOU WIN!";
      notification.appendChild(title);
      
      const buttonsRow = document.createElement("div");
      buttonsRow.classList.add("game__notificationButtons");
      notification.appendChild(buttonsRow);
      
      const newGameButton = document.createElement("div");
      newGameButton.classList.add("game__notificationButton");
      newGameButton.innerText = "NEW GAME";
      const newGameHandler = () => {
        this.newGameHandler();
        if(this.closeNotification) {
          this.closeNotification();
        }
      }
      newGameButton.addEventListener("click", newGameHandler);
      buttonsRow.appendChild(newGameButton);
      
      const continueGameButton = document.createElement("div");
      continueGameButton.classList.add("game__notificationButton");
      continueGameButton.innerText = "CONTINUE";
      const continueGameHandler = () => {
        this.continueAfterWinHandler();
        if(this.closeNotification) {
          this.closeNotification();
        }
      }
      continueGameButton.addEventListener("click", continueGameHandler);
      buttonsRow.appendChild(continueGameButton);

      let selected: null|"NEW GAME"|"CONTINUE";
      const select = (selectedButton: "NEW GAME"|"CONTINUE") => {
          if(selectedButton == "NEW GAME" && selected != "NEW GAME") {
            if(selected == "CONTINUE") {
              continueGameButton.classList.remove("game__notificationButton--select");
            }
            newGameButton.classList.add("game__notificationButton--select");
            selected = "NEW GAME";
          }
          if(selectedButton == "CONTINUE" && selected != "CONTINUE") {
            if(selected == "NEW GAME") {
              newGameButton.classList.remove("game__notificationButton--select");
            }
            continueGameButton.classList.add("game__notificationButton--select");
            selected = "CONTINUE";
          }
      }
      const keyDonwHandler = (event: KeyboardEvent) => {
        event.preventDefault();
        switch(event.code) {
          case "ArrowLeft":
            select("NEW GAME");
            break;
          case "ArrowRight":
            select("CONTINUE");
            break;
          case "Enter":
            if(selected == "CONTINUE") {
              continueGameHandler();
            }
            if(selected == "NEW GAME") {
              newGameHandler();
            }
            break;
          default: 
            break;
        }
      }
      document.addEventListener("keydown", keyDonwHandler);

      this.boardWrapper.appendChild(notification);
    })
  }

  private createStarsShadow(modifier: number) {
    const starsHeight = this.game.offsetHeight;
    const starsWidth = this.game.offsetWidth;
    const starsArea = starsHeight * starsWidth;
    const numberOfStars = Math.floor((starsArea / 10000) * modifier);
    
    let shadows: string[] = [];
    for(let star = 0; star < numberOfStars; star++) {
      const shadowX = Math.floor((Math.random() * starsWidth));
      const shadowY =  Math.floor((Math.random() * starsHeight));
      const shadow = `${shadowX}px ${shadowY}px white`;
      shadows.push(shadow);
    }
    return shadows.join(", ");
  }
  private drawNewStars() {
    const shadowSmall = this.createStarsShadow(4.5);
    const shadowMedium = this.createStarsShadow(1.5);
    const shadowLarge = this.createStarsShadow(0.5);
    
    this.starsSmall.style.setProperty("box-shadow", shadowSmall);
    this.starsSmallAfter.style.setProperty("box-shadow", shadowSmall);
    this.starsMedium.style.setProperty("box-shadow", shadowMedium);
    this.starsMediumAfter.style.setProperty("box-shadow", shadowMedium);
    this.starsLarge.style.setProperty("box-shadow", shadowLarge);
    this.starsLargeAfter.style.setProperty("box-shadow", shadowLarge);
    
    const starsSpeedModifier = this.game.offsetHeight / this.box.offsetWidth;
    this.game.style.setProperty("--stars-speed-modifier", starsSpeedModifier.toString());
    this.game.style.setProperty("--game-height", `${this.game.offsetHeight}px`);
  }
}

export default Display;