
const wynik = document.getElementById("wynik");
const video = document.getElementById("video");
const przycisk = document.getElementById("skanuj");
const wlaczDzwiek = document.getElementById("wlacz-dzwiek");

const adresIntro =
    "https://archive.org/download/intro_20261103_2022/intro.mp4";

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

const ekrany = document.querySelectorAll(".ekran");

function pokazEkran(id) {
    ekrany.forEach(ekran => ekran.classList.remove("aktywny"));
    document.getElementById(id).classList.add("aktywny");
}

function zatrzymajVideo() {
    video.pause();
    video.classList.remove("odtwarzanie");
    video.removeAttribute("src");
    video.load();
    video.muted = false;
    wlaczDzwiek.style.display = "none";
}

function powrotDoMenu() {
    zatrzymajVideo();
    pokazEkran("menu");
}

function odtworzFilm(adres, typ, wyciszony = false) {
    zatrzymajVideo();

    video.src = adres;
    video.muted = wyciszony;
    video.controls = true;
    video.classList.add("odtwarzanie");

    if (wyciszony) {
        wlaczDzwiek.style.display = "block";
    }

    video.onended = () => {
        zatrzymajVideo();

        if (typ === "intro") {
            pokazEkran("menu");
        } else {
            pokazEkran("ekran-gry");
            wynik.textContent = "🟢 Przyłóż kolejny tag NFC";
        }
    };

    video.onerror = () => {
        zatrzymajVideo();

        if (typ === "intro") {
            pokazEkran("menu");
            alert("Nie udało się odtworzyć filmu intro.");
        } else {
            wynik.textContent = "Nie udało się odtworzyć filmu.";
        }
    };

    video.play().catch(() => {
        if (wyciszony) {
            wynik.textContent =
                "Dotknij ekranu, aby rozpocząć intro.";
            pokazEkran("menu");
        } else {
            wynik.textContent =
                "Dotknij filmu, aby rozpocząć odtwarzanie.";
        }
    });
}

function odtworzIntro(pierwszeUruchomienie = false) {
    if (pierwszeUruchomienie) {
        odtworzFilm(adresIntro, "intro", true);
    } else {
        odtworzFilm(adresIntro, "intro", false);
    }
}

wlaczDzwiek.addEventListener("click", () => {
    video.muted = false;
    video.play();
    wlaczDzwiek.style.display = "none";
});

// MENU

document.getElementById("rozpocznij").addEventListener("click", () => {
    pokazEkran("ekran-gry");
    wynik.textContent = "Aktywuj NFC i przyłóż tag.";
});

document.getElementById("pokaz-intro").addEventListener("click", () => {
    odtworzIntro(false);
});

document.getElementById("pokaz-instrukcje").addEventListener("click", () => {
    pokazEkran("widok-instrukcji");
});

document.getElementById("pokaz-o-grze").addEventListener("click", () => {
    pokazEkran("widok-ogra");
});

document.getElementById("pokaz-ustawienia").addEventListener("click", () => {
    pokazEkran("widok-ustawien");
});

document.getElementById("powrot-instrukcja").addEventListener("click", powrotDoMenu);
document.getElementById("powrot-o-grze").addEventListener("click", powrotDoMenu);
document.getElementById("powrot-ustawienia").addEventListener("click", powrotDoMenu);
document.getElementById("powrot-menu").addEventListener("click", powrotDoMenu);

// LOSOWANIE FILMU Z KRAINY

function losujFilm(kraina) {
    const lista = filmy[kraina];

    if (!lista || lista.length === 0) {
        wynik.textContent = "Brak filmów dla tej krainy.";
        return;
    }

    const wylosowany = lista[
        Math.floor(Math.random() * lista.length)
    ];

    wynik.textContent = "🎬 Wylosowano film dla krainy: " + kraina;

    odtworzFilm(wylosowany, "kraina", false);
}

// NFC

let nfcAktywne = false;

przycisk.addEventListener("click", async () => {
    if (nfcAktywne) {
        wynik.textContent = "🟢 NFC jest już aktywne — przyłóż tag.";
        return;
    }

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

                    const tekst = decoder
                        .decode(record.data)
                        .trim()
                        .toLowerCase();

                    if (filmy[tekst]) {
                        pokazEkran("ekran-gry");
                        losujFilm(tekst);
                    } else {
                        wynik.textContent = "Nieznany tag: " + tekst;
                    }
                }
            }
        });

        await ndef.scan();

        nfcAktywne = true;
        wynik.textContent = "🟢 NFC aktywne — przyłóż tag.";

    } catch (error) {
        wynik.textContent = "Błąd NFC: " + error.message;
    }
});

// INTRO PRZY PIERWSZYM URUCHOMIENIU

window.addEventListener("load", () => {
    let introPokazane = false;

    try {
        introPokazane = localStorage.getItem("wieza_intro_pokazane") === "tak";

        if (!introPokazane) {
            localStorage.setItem("wieza_intro_pokazane", "tak");
        }
    } catch (error) {
        introPokazane = true;
    }

    if (!introPokazane) {
        odtworzIntro(true);
    }
});
