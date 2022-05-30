const waitForDirrection = (container: any, target: any) => {
  return new Promise<"RIGHT"|"LEFT"|"TOP"|"BOTTOM">((resolve) => {
    const resolvePromise = (dirrection: "RIGHT"|"LEFT"|"TOP"|"BOTTOM") => {
      container.style.setProperty("cursor", "auto");
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      resolve(dirrection);
    }


    const handleKeyDown = (event: KeyboardEvent) => {
      switch(event.code) {
        case "ArrowRight":
          event.preventDefault();
          resolvePromise("RIGHT");
          break;
        case "ArrowLeft":
          event.preventDefault();
          resolvePromise("LEFT");
          break;
        case "ArrowUp":
          event.preventDefault();
          resolvePromise("TOP");
          break;
        case "ArrowDown":
          event.preventDefault();
          resolvePromise("BOTTOM");
          break;
        default:
          break;
      }        
    }


    let touchStartX: number;
    let touchStartY: number;
    let touchMoveX: number;
    let touchMoveY: number;     

    const handleTouchStart = (event: TouchEvent) => {
      if(target == event.target || target.contains(event.target)) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        touchMoveX = event.touches[0].clientX;
        touchMoveY = event.touches[0].clientY;
      }
    }
    const handleTouchMove = (event: TouchEvent) => {
      if(target == event.target || target.contains(event.target)) {
        touchMoveX = event.touches[0].clientX;
        touchMoveY = event.touches[0].clientY;
      }
    }
    const handleTouchEnd = (event: TouchEvent) => {
      if(target == event.target || target.contains(event.target)) {
        let distanceX = 0;
        let distanceY = 0;
        if(touchMoveX) {
          distanceX = touchMoveX - touchStartX;
        }
        if(touchMoveY) {
          distanceY = touchMoveY - touchStartY;
        }
        if(distanceX > 0 && Math.abs(distanceX) > Math.abs(distanceY)) {
          resolvePromise("RIGHT");
        }
        else if(distanceX < 0 && Math.abs(distanceX) > Math.abs(distanceY)) {
          resolvePromise("LEFT");
        }
        else if(distanceY < 0 && Math.abs(distanceX) < Math.abs(distanceY)) {
          resolvePromise("TOP");
        }
        else if(distanceY > 0 && Math.abs(distanceX) < Math.abs(distanceY)) {
          resolvePromise("BOTTOM");
        }
      }
    }

    
    let mouseDownX: number;
    let mouseDownY: number;
    let grabbing: boolean = false;
    target.style.setProperty("cursor", "grab");
    
    const handleMouseDown = (event: MouseEvent) => {
      if(target == event.target || target.contains(event.target)) {
        mouseDownX = event.clientX;
        mouseDownY = event.clientY;
        setTimeout(() => {
          target.style.setProperty("cursor", "grabbing");
          container.style.setProperty("cursor", "grabbing");
        }, 1);
        grabbing = true;
      }
    }
    const handleMouseUp = (event: MouseEvent) => {
      setTimeout(() => {
        target.style.setProperty("cursor", "grab");
        container.style.setProperty("cursor", "auto");
      }, 1);
      if(grabbing) {
        let distanceX = event.clientX - mouseDownX;
        let distanceY = event.clientY - mouseDownY;
        
        grabbing = false;
        
        if(distanceX > 0 && Math.abs(distanceX) > Math.abs(distanceY)) {
          resolvePromise("RIGHT");
        }
        else if(distanceX < 0 && Math.abs(distanceX) > Math.abs(distanceY)) {
          resolvePromise("LEFT");
        }
        else if(distanceY < 0 && Math.abs(distanceX) < Math.abs(distanceY)) {
          resolvePromise("TOP");
        }
        else if(distanceY > 0 && Math.abs(distanceX) < Math.abs(distanceY)) {
          resolvePromise("BOTTOM");
        }
      }
    }
    

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
  })
}

export default waitForDirrection;