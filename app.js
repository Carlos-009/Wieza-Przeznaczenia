
const wynik = document.getElementById("wynik");
const video = document.getElementById("video");
const przycisk = document.getElementById("skanuj");
const wlaczDzwiek = document.getElementById("wlacz-dzwiek");
// ELEMENTY LOSOWANIA PRZEDMIOTÓW

const ekranPrzedmiotow = document.getElementById("ekran-przedmiotow");
const obrazLosowania = document.getElementById("obraz-losowania");
const nazwaPrzedmiotu = document.getElementById("nazwa-przedmiotu");
const wyborKoloru = document.getElementById("wybor-koloru");

const przyciskDostepny = document.getElementById("przedmiot-dostepny");
const przyciskBrak = document.getElementById("przedmiot-brak");
const przyciskPowrotLosowania = document.getElementById("powrot-losowania");

// PULA 12 ZWYKŁYCH PRZEDMIOTÓW I 2 SPECJALNYCH

const przedmioty = [
    { nazwa: "Miecz 1", obraz: "miecz1.jpg", dzwiek: "Atak1.mp3" },
    { nazwa: "Miecz 2", obraz: "miecz2.jpg", dzwiek: "Atak2.mp3" },
    { nazwa: "Miecz 3", obraz: "miecz3.jpg", dzwiek: "Atak3.mp3" },
    { nazwa: "Miecz 4", obraz: "miecz4.jpg", dzwiek: "Atak4.mp3" },
    { nazwa: "Miecz 5", obraz: "miecz5.jpg", dzwiek: "Atak5.mp3" },

    { nazwa: "Tarcza 1", obraz: "tarcza1.jpg", dzwiek: "Obrona1.mp3" },
    { nazwa: "Tarcza 2", obraz: "tarcza2.jpg", dzwiek: "Obrona2.mp3" },
    { nazwa: "Tarcza 3", obraz: "tarcza3.jpg", dzwiek: "Obrona3.mp3" },
    { nazwa: "Tarcza 4", obraz: "tarcza4.jpg", dzwiek: "Obrona4.mp3" },
    { nazwa: "Tarcza 5", obraz: "tarcza5.jpg", dzwiek: "Obrona5.mp3" },

    { nazwa: "Lina", obraz: "lina1.jpg", dzwiek: "Lina.mp3" },
    { nazwa: "Drabina", obraz: "drabina1.jpg", dzwiek: "Drabina.mp3" },

    { nazwa: "Podwójny atak", obraz: "atak_x2.jpg", dzwiek: "Atak_x2.mp3", specjalny: "atak" },
    { nazwa: "Podwójna obrona", obraz: "obrona_x2.jpg", dzwiek: "Obrona_x2.mp3", specjalny: "obrona" }
];

// PAMIĘĆ ZDOBYWCÓW SPECJALNYCH ŻETONÓW

let zdobyteSpecjalne = {};

try {
    zdobyteSpecjalne = JSON.parse(
        localStorage.getItem("wieza_specjalne") || "{}"
    );
} catch (error) {
    zdobyteSpecjalne = {};
}

const adresDzwieku = nazwa => "dzwieki/" + nazwa;

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
