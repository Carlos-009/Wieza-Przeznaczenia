
const wynik = document.getElementById("wynik");
const przycisk = document.getElementById("skanuj");
const video = document.getElementById("video");

const filmy = {
    las: Array.from({ length: 18 }, (_, i) =>
        `https://archive.org/download/plikiWP/las${String(i + 1).padStart(2, "0")}.mp4`
    ),

    gory: Array.from({ length: 18 }, (_, i) =>
        `https://archive.org/download/plikiWP/gory${String(i + 1).padStart(2, "0")}.mp4`
    ),

    miasto: Array.from({ length: 18 }, (_, i) =>
        `https://archive.org/download/plikiWP/miasto${String(i + 1).padStart(2, "0")}.mp4`
    ),

    pola: Array.from({ length: 18 }, (_, i) =>
        `https://archive.org/download/plikiWP/pole${String(i + 1).padStart(2, "0")}.mp4`
    )
};

function losujFilm(kraina) {
    const lista = filmy[kraina];

    if (!lista || lista.length === 0) {
        wynik.textContent = "Brak filmów dla tej krainy.";
        return;
    }

    const wylosowany = lista[
        Math.floor(Math.random() * lista.length)
    ];

    video.src = wylosowany;
    video.load();

    wynik.textContent = "🌲 Wylosowano film dla krainy: " + kraina;

    video.play().catch(() => {
    wynik.textContent += " — dotknij ekranu, aby rozpocząć film.";
});
}


przycisk.addEventListener("click", async () => {

    if (!("NDEFReader" in window)) {
        wynik.textContent = "Ta przeglądarka nie obsługuje NFC.";
        return;
    }

    try {
        const ndef = new NDEFReader();

        ndef.addEventListener("reading", ({ message }) => {

            for (const record of message.records) {

                if (record.recordType === "text") {
                    const decoder = new TextDecoder(record.encoding);
                    const tekst = decoder.decode(record.data).trim().toLowerCase();

if (filmy[tekst]) {
    losujFilm(tekst);
} else {
    wynik.textContent = "Nieznany tag: " + tekst;
}
                }
            }
        });

        await ndef.scan();

        wynik.textContent = "🟢 NFC aktywne — przyłóż tag.";

    } catch (error) {
        wynik.textContent = "Błąd NFC: " + error.message;
    }
});
