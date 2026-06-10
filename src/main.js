const board = document.querySelector('.grid-container')

for (let i = 0; i < 64; i++) {
  const square = document.createElement('div')
  
  const row = Math.floor(i / 8)
  const col = i % 8

  if ((row + col) % 2 === 0) { // even squares
    square.classList.add('light-square')
  } else { // odd squares
    square.classList.add('dark-square')
  }

  board.appendChild(square)
}