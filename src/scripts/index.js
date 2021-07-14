const button = document.querySelector('.hamburger')
const layer = document.querySelector('.robotron')

window.addEventListener('resize', (event) => {
  if (event.target.innerWidth > 992) {
    button.classList.remove('hamburger_active')
    layer.classList.remove('robotron_active')
  }
})

button.addEventListener('click', () => {
  button.classList.toggle('hamburger_active')
  layer.classList.toggle('robotron_active')
})
