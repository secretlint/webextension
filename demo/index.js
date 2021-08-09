fetch("./user.json", {
    headers: {
        Authorization: "Basic YWxhZGRpbjpvcGVuc2VzYW1l"
    }
})
    .then((res) => res.json())
    .then((json) => {
        document.getElementById("user-name").textContent = json.name;
    });
