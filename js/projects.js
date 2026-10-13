export function initProjects() {
  const filterBtns = document.querySelectorAll('.filter-btn')
  const cards = document.querySelectorAll('.project-card')

  const onClick = (e) => {
    const btn = e.currentTarget
    filterBtns.forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')

    const filter = btn.getAttribute('data-filter')
    cards.forEach((card) => {
      const match = filter === 'all' || card.getAttribute('data-category') === filter
      card.classList.toggle('hidden', !match)
    })
  }

  filterBtns.forEach((btn) => btn.addEventListener('click', onClick))
  return () => filterBtns.forEach((btn) => btn.removeEventListener('click', onClick))
}