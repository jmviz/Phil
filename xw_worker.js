module = {};
importScripts('fill.js');
onmessage = function(e) {
    let cmd = e.data;
    switch (cmd[0]) {
        case 'run':
            let words = cmd[1].split(/\n/);
            let grid = cmd[2];
            grid = grid.replace(/\./g, "#");
            grid = grid.replace(/ /g, ".");

            console.log("fill:\n" + grid);
            let wordlist = new module.exports.wordlist(words);
            let filler = new module.exports.filler(grid, wordlist);
            let g = filler.grid;
            let stack = null;
            let done = false;
            let stepCount = 0;
            while (!done) {
                [stack, done] = g.fillOne(stack);
                stepCount++;
                if (stepCount % 100 === 0) {
                    let state = g.toString();
                    state = state.replace(/\./g, " ").replace(/#/g, ".");
                    postMessage(['forced', state + '\n']);
                }
            }
            let result = g.toString();
            console.log("result:\n" + result);
            if (result.indexOf(".") == -1) {
              result = result.replace(/\./g, " ");
              result = result.replace(/#/g, ".");
              postMessage(["sat", result + "\n"]);
            } else {
              postMessage(["unsat"]);
            }
            break;
        case 'cancel':
            postMessage(["ack_cancel"]);
            break;
    }
};
