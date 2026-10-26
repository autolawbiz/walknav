document.addEventListener("DOMContentLoaded", () => {

    console.log("script.js loaded");

    document.getElementById("tokyo-btn")
        .addEventListener("click", () => {
            console.log("東京駅を選択");
        });

    document.getElementById("yokohama-btn")
        .addEventListener("click", () => {
            console.log("横浜駅を選択");
        });

});