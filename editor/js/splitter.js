// this file just prepares the frontend UI excluding the canvas


import Split from 'split.js'

Split(['#left', '#drawarea'], {
    sizes: [30, 70],
}
)
Split(['#editor', '#imported'], {
    direction: 'vertical',
    minSize: 0,
    sizes: [75, 25],
})