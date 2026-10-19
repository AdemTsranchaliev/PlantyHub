function start() {
  void import('./main.tsx')
}

// The homepage HTML already contains the hero. Evaluating the app bundle
// before that frame paints is what held first paint at ~5s on a slow phone.
const boot = document.getElementById('boot')
if (boot) {
  requestAnimationFrame(() => {
    requestAnimationFrame(start)
  })
} else {
  start()
}
