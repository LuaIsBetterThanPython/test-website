document.getElementById("solver-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const eq1 = document.getElementById("eq1").value.replace(/\s+/g, '');
    const eq2 = document.getElementById("eq2").value.replace(/\s+/g, '');

    function parseEquation(eq) {
        // Match something like: 2x+3y=6 or -x-2y=3
        const match = eq.match(/^([+-]?\d*\.?\d*)x([+-]?\d*\.?\d*)y=([+-]?\d*\.?\d*)$/);
        if (!match) return null;

        let a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1]);
        let b = match[2] === '' || match[2] === '+' ? 1 : match[2] === '-' ? -1 : parseFloat(match[2]);
        let c = parseFloat(match[3]);

        return [a, b, c];
    }

    const eq1Parsed = parseEquation(eq1);
    const eq2Parsed = parseEquation(eq2);

    if (!eq1Parsed || !eq2Parsed) {
        document.getElementById("result-error").textContent = "Invalid equation format! Use ax + by = c.";
        document.getElementById("result-x").textContent = "x = ?";
        document.getElementById("result-y").textContent = "y = ?";
        return;
    } else {
        document.getElementById("result-error").textContent = "";
    }

    const [a1, b1, c1] = eq1Parsed;
    const [a2, b2, c2] = eq2Parsed;

    const EPS = 1e-10;
    const denominator = a1 * b2 - a2 * b1;

    if (Math.abs(denominator) < EPS) {
        // Check for infinite solutions or no solution
        const ratioA = a2 !== 0 ? a1 / a2 : null;
        const ratioB = b2 !== 0 ? b1 / b2 : null;
        const ratioC = c2 !== 0 ? c1 / c2 : null;

        const ratios = [ratioA, ratioB, ratioC].filter(r => r !== null);
        const allEqual = ratios.every(r => Math.abs(r - ratios[0]) < EPS);

        if (allEqual) {
            document.getElementById("result-x").textContent = "Infinite solutions";
            document.getElementById("result-y").textContent = "Infinite solutions";
        } else {
            document.getElementById("result-x").textContent = "No solution";
            document.getElementById("result-y").textContent = "No solution";
        }
    } else {
        // Unique solution
        const xVal = (c1 * b2 - b1 * c2) / denominator;
        const yVal = (a1 * c2 - a2 * c1) / denominator;

        document.getElementById("result-x").textContent = "x = " + xVal;
        document.getElementById("result-y").textContent = "y = " + yVal;
    }
});
