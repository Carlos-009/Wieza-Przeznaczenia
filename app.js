
const wynik = document.getElementById("wynik");
const przycisk = document.getElementById("skanuj");
const video = document.getElementById("video");
const przyciskOdtwarzania = document.getElementById("odtworz");

const filmy = {
    las: [
        "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
    ]
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

    przyciskOdtwarzania.hidden = false;

    video.play().then(() => {
        przyciskOdtwarzania.hidden = true;
    }).catch(() => {
        wynik.textContent += " — naciśnij ODTWÓRZ FILM.";
    });
}

przyciskOdtwarzania.addEventListener("click", () => {
    video.play();
});

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

                    if (tekst === "las") {
                        losujFilm("las");
                    } else {
                        wynik.textContent = "Odczytano tag: " + tekst;
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
