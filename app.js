
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

// ELEMENTY LOSOWANIA CZAROWNICY

const ekranCzarownicy = document.getElementById("ekran-czarownicy");
const obrazCzarownicy = document.getElementById("obraz-czarownicy");
const nazwaCzarownicy = document.getElementById("nazwa-czarownicy");
const przyciskPowrotCzarownicy = document.getElementById("powrot-czarownicy");

// PULA 12 ZWYKŁYCH PRZEDMIOTÓW I 2 SPECJALNYCH

const przedmioty = [
    { nazwa: "Miecz 1", obraz: "miecz1.jpg", dzwiek: "atak1.mp3" },
    { nazwa: "Miecz 2", obraz: "miecz2.jpg", dzwiek: "atak2.mp3" },
    { nazwa: "Miecz 3", obraz: "miecz3.jpg", dzwiek: "atak3.mp3" },
    { nazwa: "Miecz 4", obraz: "miecz4.jpg", dzwiek: "atak4.mp3" },
    { nazwa: "Miecz 5", obraz: "miecz5.jpg", dzwiek: "atak5.mp3" },

    { nazwa: "Tarcza 1", obraz: "tarcza1.jpg", dzwiek: "obrona1.mp3" },
    { nazwa: "Tarcza 2", obraz: "tarcza2.jpg", dzwiek: "obrona2.mp3" },
    { nazwa: "Tarcza 3", obraz: "tarcza3.jpg", dzwiek: "obrona3.mp3" },
    { nazwa: "Tarcza 4", obraz: "tarcza4.jpg", dzwiek: "obrona4.mp3" },
    { nazwa: "Tarcza 5", obraz: "tarcza5.jpg", dzwiek: "obrona5.mp3" },

    { nazwa: "Lina", obraz: "lina1.jpg", dzwiek: "lina.mp3" },
    { nazwa: "Drabina", obraz: "drabina1.jpg", dzwiek: "Drabina.mp3" },

    { nazwa: "Podwójny atak", obraz: "atak_x2.jpg", dzwiek: "atak_x2.mp3", specjalny: "atak" },
    { nazwa: "Podwójna obrona", obraz: "obrona_x2.jpg", dzwiek: "obron_x2.mp3", specjalny: "obrona" }
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
// SPRAWDZANIE, CZY SPECJALNY ŻETON JEST JESZCZE DOSTĘPNY

function czySpecjalnyDostepny(przedmiot) {
    if (!przedmiot.specjalny) {
        return true;
    }

    const zdobywcy = zdobyteSpecjalne[przedmiot.specjalny] || [];

    return zdobywcy.length < 4;
}

// ZAPISYWANIE ZDOBYWCY SPECJALNEGO ŻETONU

function zapiszZdobywce(typ, kolor) {
    if (!zdobyteSpecjalne[typ]) {
        zdobyteSpecjalne[typ] = [];
    }

    if (!zdobyteSpecjalne[typ].includes(kolor)) {
        zdobyteSpecjalne[typ].push(kolor);
    }

    localStorage.setItem(
        "wieza_specjalne",
        JSON.stringify(zdobyteSpecjalne)
    );
}
// RESETOWANIE GRY

function resetujGre() {
    const potwierdzenie = confirm(
        "Czy na pewno chcesz rozpocząć nową grę? Wszystkie zdobyte podwójne ataki i podwójne obrony zostaną wyzerowane."
    );

    if (!potwierdzenie) {
        return;
    }

    zdobyteSpecjalne = {};

    localStorage.setItem(
        "wieza_specjalne",
        JSON.stringify(zdobyteSpecjalne)
    );

    alert("Gra została zresetowana! Można rozpocząć nową rozgrywkę.");
}
// AKTUALNIE WYLOSOWANY PRZEDMIOT

let aktualnyPrzedmiot = null;
let losowanieTrwa = false;
let dzwiekPrzedmiotu = null;

// POWRÓT DO GŁÓWNEGO LOSOWANIA

function powrotDoLosowania() {
    if (dzwiekPrzedmiotu) {
        dzwiekPrzedmiotu.pause();
        dzwiekPrzedmiotu = null;
    }

    obrazLosowania.src = "";
    wyborKoloru.style.display = "none";

    przyciskDostepny.style.display = "none";
    przyciskBrak.style.display = "none";
    przyciskPowrotLosowania.style.display = "none";

    nazwaPrzedmiotu.textContent = "Przyłóż tag NFC, aby losować.";
    pokazEkran("ekran-gry");

    wynik.textContent = "🟢 NFC aktywne — przyłóż tag przedmiotu.";
}

// WYŚWIETLENIE WYLOSOWANEGO PRZEDMIOTU

function pokazWylosowanyPrzedmiot(przedmiot) {
    aktualnyPrzedmiot = przedmiot;

    obrazLosowania.src = "przedmioty/" + przedmiot.obraz;
    nazwaPrzedmiotu.textContent = przedmiot.nazwa;

    przyciskDostepny.style.display = przedmiot.specjalny ? "none" : "block";
    przyciskBrak.style.display = przedmiot.specjalny ? "none" : "block";
    przyciskPowrotLosowania.style.display = "block";

    if (przedmiot.specjalny) {
        wyborKoloru.style.display = "flex";

        const zdobywcy = zdobyteSpecjalne[przedmiot.specjalny] || [];

        document.querySelectorAll("#wybor-koloru button").forEach(button => {
            button.disabled = zdobywcy.includes(button.dataset.kolor);
            button.style.opacity = button.disabled ? "0.35" : "1";
        });
    } else {
        wyborKoloru.style.display = "none";
    }

dzwiekPrzedmiotu = new Audio(adresDzwieku(przedmiot.dzwiek));

dzwiekPrzedmiotu.play().catch(error => {
    console.log("Nie udało się odtworzyć dźwięku:", error);
});
}

// LOSOWANIE Z ANIMACJĄ

// LOSOWANIE U CZAROWNICY Z FILMEM

function losujCzarownice() {
    pokazEkran("ekran-czarownicy");
    const panelCzarownicy = ekranCzarownicy.querySelector(".panel");
    panelCzarownicy.classList.remove("magiczne-wejscie");
    
    nazwaCzarownicy.textContent = "🧙‍♀️ Czarownica warzy eliksir...";

    obrazCzarownicy.style.display = "none";

    video.src = "https://archive.org/download/czarownica_czaruje/czarownica_czaruje.mp4";
    video.loop = false;
    video.controls = false;
    video.muted = false;
    video.classList.add("odtwarzanie");

    video.onended = () => {
        video.classList.remove("odtwarzanie");
        video.pause();
        video.removeAttribute("src");
        video.load();
   void panelCzarownicy.offsetWidth;
        panelCzarownicy.classList.add("magiczne-wejscie");
        const sukces = Math.random() < 0.2;

        obrazCzarownicy.style.display = "block";

        if (sukces) {
            obrazCzarownicy.src = "przedmioty/eliksir.jpg";
            nazwaCzarownicy.textContent = "✨ ELIKSIR NIEWIDZIALNOŚCI!";

            const glos = new Audio(
                adresDzwieku("czarownica_eliksir.mp3")
            );

            glos.play().catch(error => {
                console.log("Błąd głosu czarownicy:", error);
            });

        } else {
            obrazCzarownicy.src = "przedmioty/pudlo.jpg";
            nazwaCzarownicy.textContent = "💀 NIC Z TEGO!";

            const glos = new Audio(
                adresDzwieku("czarownica_pudlo.mp3")
            );

            glos.play().catch(error => {
                console.log("Błąd śmiechu czarownicy:", error);
            });
        }
    };

    video.onerror = () => {
        nazwaCzarownicy.textContent = "Nie udało się odtworzyć filmu.";
        video.classList.remove("odtwarzanie");
    };

    video.play().catch(error => {
        console.log("Błąd odtwarzania filmu czarownicy:", error);
        nazwaCzarownicy.textContent = "Nie udało się uruchomić filmu.";
    });
}

przyciskPowrotCzarownicy.addEventListener("click", () => {
    zatrzymajVideo();
    video.onended = null;
    video.onerror = null;
    pokazEkran("ekran-gry");
});

function losujPrzedmiot() {
    if (losowanieTrwa) return;

    if (dzwiekPrzedmiotu) {
        dzwiekPrzedmiotu.pause();
        dzwiekPrzedmiotu.currentTime = 0;
        dzwiekPrzedmiotu = null;
    }

    const dostepne = przedmioty.filter(czySpecjalnyDostepny);

    if (dostepne.length === 0) {
        nazwaPrzedmiotu.textContent = "Wszystkie przedmioty specjalne zostały rozdane.";
        return;
    }

    losowanieTrwa = true;
    const dzwiekLosowania = new Audio(
    adresDzwieku("losowanie_tajemnicze.mp3")
);

dzwiekLosowania.volume = 0.3;

dzwiekLosowania.play().catch(error => {
    console.log("Nie udało się odtworzyć dźwięku losowania:", error);
});
    pokazEkran("ekran-przedmiotow");

    przyciskDostepny.style.display = "none";
    przyciskBrak.style.display = "none";
    przyciskPowrotLosowania.style.display = "none";
    wyborKoloru.style.display = "none";

    nazwaPrzedmiotu.textContent = "🎲 Losowanie...";

    let czas = 0;
    let opoznienie = 60;
    const czasCalkowity = 5000;

    function zmienObraz() {
        const przedmiot = dostepne[
            Math.floor(Math.random() * dostepne.length)
        ];

        obrazLosowania.src = "przedmioty/" + przedmiot.obraz;

        czas += opoznienie;

        if (czas >= czasCalkowity) {
            losowanieTrwa = false;
            dzwiekLosowania.pause();
            const wynikLosowania = dostepne[
                Math.floor(Math.random() * dostepne.length)
            ];

            pokazWylosowanyPrzedmiot(wynikLosowania);
            return;
        }

        opoznienie *= 1.18;

        setTimeout(zmienObraz, opoznienie);
    }

    zmienObraz();
}
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
// OBSŁUGA PRZYCISKÓW LOSOWANIA

// Gracz zabiera zwykły przedmiot i wraca do oczekiwania na NFC
przyciskDostepny.addEventListener("click", () => {
    powrotDoLosowania();
});

// Przedmiotu nie ma w banku – losujemy ponownie
przyciskBrak.addEventListener("click", () => {
    losujPrzedmiot();
});

// Powrót do oczekiwania na kolejne losowanie
przyciskPowrotLosowania.addEventListener("click", () => {
    powrotDoLosowania();
});

// Wybór koloru gracza przy podwójnym ataku i obronie
document.querySelectorAll("#wybor-koloru button").forEach(button => {
    button.addEventListener("click", () => {
        if (!aktualnyPrzedmiot || !aktualnyPrzedmiot.specjalny) {
            return;
        }

        const kolor = button.dataset.kolor;

        zapiszZdobywce(aktualnyPrzedmiot.specjalny, kolor);

        wyborKoloru.style.display = "none";

        nazwaPrzedmiotu.textContent =
            aktualnyPrzedmiot.nazwa + " – zdobył gracz: " + kolor.toUpperCase();

        przyciskPowrotLosowania.style.display = "block";
    });
});
// NFC

let nfcAktywne = false;
// OBSŁUGA DŹWIĘKU W PRZEGLĄDARCE
let kontekstAudio = null;
function odblokujDzwiek() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    if (!kontekstAudio) {
        kontekstAudio = new AudioContext();
    }

    if (kontekstAudio.state === "suspended") {
        kontekstAudio.resume();
    }

    const bufor = kontekstAudio.createBuffer(1, 1, 22050);
    const zrodlo = kontekstAudio.createBufferSource();

    zrodlo.buffer = bufor;
    zrodlo.connect(kontekstAudio.destination);
    zrodlo.start(0);
}

przycisk.addEventListener("click", async () => {
        odblokujDzwiek();
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

} else if (tekst === "przedmiot") {
    losujPrzedmiot();

} else if (tekst === "czarownica") {
    losujCzarownice();

} else if (tekst === "walka") {
    pokazEkran("ekran-wyboru-walki");
    wynik.textContent = "Wybierz, jaką walkę teraz stoczysz.";

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
// WYBORY ŻETONÓW OBU RYCERZY

let wyborPierwszegoRycerza = [];
let wyborDrugiegoRycerza = [];

let aktualnyWyborRycerza = 1;
// TWORZENIE PRZYCISKÓW ŻETONÓW POJEDYNKU

function pokazZetonyPojedynku() {

    const atak = document.getElementById("atak-pojedynku");
    const obrona = document.getElementById("obrona-pojedynku");
    const specjalne = document.getElementById("specjalne-pojedynku");

    atak.classList.add("zetony-wyboru");
    obrona.classList.add("zetony-wyboru");
    specjalne.classList.add("zetony-wyboru");

    atak.innerHTML = "";
    obrona.innerHTML = "";
    specjalne.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
        dodajZeton(atak, "miecz" + i + ".jpg", "atak", i);
        dodajZeton(obrona, "tarcza" + i + ".jpg", "obrona", i);
    }

    dodajZeton(specjalne, "atak_x2.jpg", "atak_x2", 4);
    dodajZeton(specjalne, "obrona_x2.jpg", "obrona_x2", 4);
}

function dodajZeton(kontener, plik, typ, wartosc) {

    const przycisk = document.createElement("button");
    przycisk.className = "zeton-wyboru";
    przycisk.dataset.typ = typ;
    przycisk.dataset.wartosc = wartosc;

    const obraz = document.createElement("img");
    obraz.src = "przedmioty/" + plik;
    obraz.alt = plik;

    przycisk.appendChild(obraz);

    przycisk.addEventListener("click", () => {
        przycisk.classList.toggle("wybrany");
    });

    kontener.appendChild(przycisk);
}
// FILMY LOSUJĄCE SIŁĘ ATAKU

const filmySilyAtaku = [
    "https://archive.org/download/sila_ataku2_202611/sila_ataku1.mp4",
    "https://archive.org/download/sila_ataku2_202611/sila_ataku2.mp4",
    "https://archive.org/download/sila_ataku2_202611/sila_ataku3.mp4",
    "https://archive.org/download/sila_ataku2_202611/sila_ataku4.mp4",
    "https://archive.org/download/sila_ataku2_202611/sila_ataku5.mp4"
];
// WYNIKI SIŁY ATAKU RYCERZY

let silaPierwszegoRycerza = 0;
let silaDrugiegoRycerza = 0;

function losujSileAtaku(numerRycerza) {

    const sila = Math.floor(Math.random() * 5) + 1;
    const adres = filmySilyAtaku[sila - 1];

    video.pause();
    video.onended = null;
    video.onerror = null;

    video.src = adres;
    video.loop = false;
    video.controls = false;
    video.muted = false;
    video.classList.add("odtwarzanie");

    video.onended = () => {

        video.classList.remove("odtwarzanie");
        video.pause();
        video.removeAttribute("src");
        video.load();

        if (numerRycerza === 1) {
            silaPierwszegoRycerza = sila;

            document.getElementById("wynik-pojedynku").textContent =
                "SIŁA PIERWSZEGO RYCERZA: " + sila;

            document.getElementById("kolej-przeciwnika").style.display =
                "block";

        } else {
            silaDrugiegoRycerza = sila;

            document.getElementById("wynik-pojedynku").innerHTML =
    "SIŁA PIERWSZEGO RYCERZA: " + silaPierwszegoRycerza +
    "<br>SIŁA DRUGIEGO RYCERZA: " + silaDrugiegoRycerza;
        }
    };

    video.onerror = () => {
        video.classList.remove("odtwarzanie");
        document.getElementById("wynik-pojedynku").textContent =
            "Nie udało się odtworzyć filmu.";
    };

    video.play().catch(error => {
        console.log("Błąd filmu siły ataku:", error);
    });
}
// WYBÓR RODZAJU WALKI

document.getElementById("wybierz-walke-rycerzy")
    .addEventListener("click", () => {

        pokazEkran("ekran-pojedynku");

        silaPierwszegoRycerza = 0;
        silaDrugiegoRycerza = 0;

        document.getElementById("kolej-przeciwnika").style.display = "none";

        losujSileAtaku(1);
    });

// KOLEJ DRUGIEGO RYCERZA

document.getElementById("kolej-przeciwnika")
    .addEventListener("click", () => {

        document.getElementById("kolej-przeciwnika").style.display = "none";

        losujSileAtaku(2);
    });
// POWRÓT Z WYBORU WALKI

document.getElementById("powrot-z-walki")
    .addEventListener("click", () => {
        pokazEkran("ekran-gry");
        wynik.textContent = "🟢 NFC aktywne — przyłóż kolejny tag.";
    });
// ROZPOCZĘCIE FINAŁU ZE SMOKIEM

document.getElementById("wybierz-final-smok")
    .addEventListener("click", () => {
        pokazEkran("ekran-finalu");

        document.getElementById("wynik-finalu").textContent =
            "Wybierz kolor swojego rycerza.";
    });
// WYBÓR KOLORU RYCERZA DO FINAŁU

let wybranyKolorRycerza = null;

document.querySelectorAll("[data-rycerz]").forEach(button => {
    button.addEventListener("click", () => {

        wybranyKolorRycerza = button.dataset.rycerz;

        document.getElementById("wynik-finalu").textContent =
            "Wybrany rycerz: " + wybranyKolorRycerza.toUpperCase() +
            ". Przygotuj się do walki ze smokiem!";
    });
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
