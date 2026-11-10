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
         const dzwiekNFC = new Audio("dzwieki/nfc.wav");
            dzwiekNFC.play().catch(() => {});
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

// WYŚWIETLANIE ŻETONÓW W WALCE ZE SMOKIEM

function pokazZetonyFinalu() {

    const atak = document.getElementById("zetony-ataku");
    const obrona = document.getElementById("zetony-obrony");
    const specjalne = document.getElementById("zetony-specjalne");

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

    if (typ === "atak" || typ === "obrona") {
        przycisk.textContent = wartosc;
    } else {
        const obraz = document.createElement("img");
        obraz.src = "przedmioty/" + plik;
        obraz.alt = plik;
        przycisk.appendChild(obraz);
    }

przycisk.addEventListener("click", () => {

    const ekran = przycisk.closest(".ekran");

    const wybrane = ekran.querySelectorAll(".wybrany");
    
    const zwykly = Array.from(wybrane).find(el =>
    el.dataset.typ === "atak" ||
    el.dataset.typ === "obrona"
);
        const specjalny = Array.from(wybrane).find(el =>
            el.dataset.typ === "atak_x2" ||
            el.dataset.typ === "obrona_x2"
        );

        if (przycisk.classList.contains("wybrany")) {
            przycisk.classList.remove("wybrany");
            return;
        }

        if (typ === "atak" || typ === "obrona") {
            if (zwykly) {
                zwykly.classList.remove("wybrany");
            }

            if (specjalny &&
                !(
                    (typ === "atak" && specjalny.dataset.typ === "atak_x2") ||
                    (typ === "obrona" && specjalny.dataset.typ === "obrona_x2")
                )
            ) {
                specjalny.classList.remove("wybrany");
            }

        } else {
            if (specjalny) {
                specjalny.classList.remove("wybrany");
            }

            if (zwykly) {
                const zgodny =
                    (typ === "atak_x2" && zwykly.dataset.typ === "atak") ||
                    (typ === "obrona_x2" && zwykly.dataset.typ === "obrona");

                if (!zgodny) {
                    return;
                }
            }
        }

        przycisk.classList.add("wybrany");
    });

    kontener.appendChild(przycisk);
}
// FILMY LOSUJĄCE SIŁĘ ATAKU

const filmySilyAtaku = [
    "https://archive.org/download/atak_rycerzy/sila_ataku01.mp4",
    "https://archive.org/download/atak_rycerzy/sila_ataku02.mp4",
    "https://archive.org/download/atak_rycerzy/sila_ataku03.mp4",
    "https://archive.org/download/atak_rycerzy/sila_ataku04.mp4",
    "https://archive.org/download/atak_rycerzy/sila_ataku05.mp4"
];

// FILMY OGNIA SMOKA W FINALE

const filmyOgniaSmoka = [
    "https://archive.org/download/walkaogien/Ogien0.mp4",
    "https://archive.org/download/walkaogien/ogien1.mp4",
    "https://archive.org/download/walkaogien/ogien2.mp4"
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
    document.getElementById("powrot-pojedynku").style.display = "none";
    video.onended = () => {
document.getElementById("powrot-pojedynku").style.display = "block";
        video.classList.remove("odtwarzanie");
        video.pause();
        video.removeAttribute("src");
        video.load();

        if (numerRycerza === 1) {
    silaPierwszegoRycerza = sila;

    document.getElementById("wynik-pojedynku").innerHTML =
        "<h2>SIŁA RYCERZA ATAKUJĄCEGO: " + sila + "</h2>" +
        "<hr>" +
        "<h2>TERAZ PORA NA RYCERZA BRONIĄCEGO SIĘ!</h2>" +
        "<p>Przekaż telefon drugiemu graczowi.</p>" +
        "<p>Niech wylosuje swoją siłę ataku.</p>";

    document.getElementById("kolej-przeciwnika").textContent =
        "⚔️ RYCERZ BRONIĄCY SIĘ — LOSUJ SIŁĘ";

    document.getElementById("kolej-przeciwnika").style.display =
        "block";

        } else {
    silaDrugiegoRycerza = sila;

    document.getElementById("wynik-pojedynku").innerHTML =
        "<h2>WYNIKI LOSOWANIA SIŁY</h2>" +
        "<p>RYCERZ ATAKUJĄCY: " +
        silaPierwszegoRycerza + "</p>" +
        "<p>RYCERZ BRONIĄCY SIĘ: " +
        silaDrugiegoRycerza + "</p>" +
        "<hr>" +
        "<p>Obaj rycerze wylosowali już swoją siłę!</p>" +
        "<p>Teraz przechodzimy do wyboru żetonów.</p>";

    document.getElementById("kolej-przeciwnika").style.display =
        "none";

    document.getElementById("oblicz-pojedynek").style.display =
        "none";
document.getElementById("powrot-pojedynku").style.display = "none";
    setTimeout(() => {
        rozpocznijWyborZetonow();
    }, 1500);
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

        document.getElementById("kolej-przeciwnika").style.display = "block";
        document.getElementById("kolej-przeciwnika").textContent =
            "⚔️ LOSUJ SIŁĘ ATAKU";

        document.getElementById("wynik-pojedynku").innerHTML =
            "<h2>JESTEŚ RYCERZEM ATAKUJĄCYM!</h2>" +
            "<p>To Ty wkroczyłeś na pole zajęte przez innego rycerza.</p>" +
            "<p>Przygotuj się do walki i wylosuj swoją siłę ataku.</p>";
    });

// ROZPOCZĘCIE WYBORU ŻETONÓW

function rozpocznijWyborZetonow() {
    wyborPierwszegoRycerza = [];
    wyborDrugiegoRycerza = [];
    aktualnyWyborRycerza = 1;

    pokazZetonyPojedynku();

    document.getElementById("zatwierdz-wybor-pojedynku").style.display = "block";
    document.getElementById("rezygnuje-z-zetonow-pojedynku").style.display = "block";

    document.getElementById("wynik-zetonow-pojedynku").innerHTML =
    "<h2>WYBÓR ŻETONÓW — RYCERZ ATAKUJĄCY</h2>" +
    "<p>Siła atakującego: <strong>" +
    silaPierwszegoRycerza + "</strong></p>" +
    "<p>Siła broniącego się: <strong>" +
    silaDrugiegoRycerza + "</strong></p>" +
    "<hr>" +
    "<p>Wybierz swoje żetony.</p>";

    pokazEkran("ekran-zetonow-pojedynku");
}

// OBLICZANIE WYNIKU RYCERZA

function obliczSileRycerza(sila, swojeZetony) {

    let wynik = sila;

    swojeZetony.forEach(zeton => {

        if (zeton.typ === "atak" || zeton.typ === "obrona") {
            wynik += zeton.wartosc;
        }

        if (zeton.typ === "atak_x2" || zeton.typ === "obrona_x2") {
            wynik += 4;
        }

    });

    return wynik;
}

// ROZSTRZYGNIĘCIE POJEDYNKU RYCERZY

function rozstrzygnijPojedynek() {
document.getElementById("powrot-pojedynku").style.display = "block";
    const wynikPierwszego = obliczSileRycerza(
        silaPierwszegoRycerza,
        wyborPierwszegoRycerza
    );

    const wynikDrugiego = obliczSileRycerza(
        silaDrugiegoRycerza,
        wyborDrugiegoRycerza
    );

    const opisPierwszego = opiszZetonyRycerza(
        wyborPierwszegoRycerza
    );

    const opisDrugiego = opiszZetonyRycerza(
        wyborDrugiegoRycerza
    );

    let rezultat = "";

    if (wynikPierwszego > wynikDrugiego) {

        rezultat =
            "<h2>🏆 WYGRYWA RYCERZ ATAKUJĄCY!</h2>" +
            "<p style='color:red; font-weight:bold;'>" +
            "Rycerz broniący się cofa się o jedno pole.</p>" +
            "<p style='color:green; font-weight:bold;'>" +
            "Rycerz atakujący zostaje na miejscu.</p>";

    } else if (wynikDrugiego > wynikPierwszego) {

        rezultat =
            "<h2>🏆 WYGRYWA RYCERZ BRONIĄCY SIĘ!</h2>" +
            "<p style='color:red; font-weight:bold;'>" +
            "Rycerz atakujący cofa się o jedno pole.</p>" +
            "<p style='color:green; font-weight:bold;'>" +
            "Rycerz broniący się zostaje na miejscu.</p>";

    } else {

        rezultat =
            "<h2>⚖️ REMIS!</h2>" +
            "<p style='color:red; font-weight:bold;'>" +
            "Rycerz atakujący cofa się o jedno pole.</p>" +
            "<p style='color:green; font-weight:bold;'>" +
            "Rycerz broniący się zostaje na miejscu.</p>";
    }

    pokazEkran("ekran-pojedynku");

    document.getElementById("wynik-pojedynku").innerHTML =

        "<h2>RYCERZ ATAKUJĄCY</h2>" +
        "Wylosowana siła ataku: " + silaPierwszegoRycerza + "<br>" +
        opisPierwszego +
        "<strong>WYNIK: " + wynikPierwszego + "</strong>" +

        "<hr>" +

        "<h2>RYCERZ BRONIĄCY SIĘ</h2>" +
        "Wylosowana siła ataku: " + silaDrugiegoRycerza + "<br>" +
        opisDrugiego +
        "<strong>WYNIK: " + wynikDrugiego + "</strong>" +

        "<hr>" +
        rezultat;
}
    
function opiszZetonyRycerza(zetony) {

    const atak = zetony.find(z => z.typ === "atak");
    const obrona = zetony.find(z => z.typ === "obrona");
    const atakX2 = zetony.find(z => z.typ === "atak_x2");
    const obronaX2 = zetony.find(z => z.typ === "obrona_x2");

    return `
        Żeton ataku: ${atak ? atak.wartosc : 0}<br>
        Żeton obrony: ${obrona ? obrona.wartosc : 0}<br>
        ${atakX2 ? "Podwójny atak: +4<br>" : ""}
        ${obronaX2 ? "Podwójna obrona: +4<br>" : ""}
    `;
}

// ZATWIERDZANIE WYBORU ŻETONÓW

function zatwierdzWyborPojedynku() {

    const wybrane = Array.from(
        document.querySelectorAll(
            "#ekran-zetonow-pojedynku .wybrany"
        )
    ).map(zeton => ({
        typ: zeton.dataset.typ,
        wartosc: Number(zeton.dataset.wartosc)
    }));

    if (aktualnyWyborRycerza === 1) {

        wyborPierwszegoRycerza = wybrane;
        aktualnyWyborRycerza = 2;

        document.querySelectorAll(
            "#ekran-zetonow-pojedynku .wybrany"
        ).forEach(zeton => {
            zeton.classList.remove("wybrany");
        });

        pokazEkran("ekran-przekazania-telefonu");

    } else {

        wyborDrugiegoRycerza = wybrane;

        document.getElementById("zatwierdz-wybor-pojedynku").style.display =
            "none";

        document.getElementById("rezygnuje-z-zetonow-pojedynku").style.display =
            "none";

        document.getElementById("wynik-zetonow-pojedynku").textContent =
            "Wybory obu rycerzy zostały zapisane!";

        setTimeout(() => {
            rozstrzygnijPojedynek();
        }, 1500);
    }
}

document.getElementById("zatwierdz-wybor-pojedynku")
    .addEventListener("click", zatwierdzWyborPojedynku);
document.getElementById("rozpocznij-wybor-drugiego")
    .addEventListener("click", () => {

        document.getElementById("wynik-zetonow-pojedynku").innerHTML =
            "<h2>WYBÓR ŻETONÓW — RYCERZ BRONIĄCY SIĘ</h2>" +
            "<p>Siła atakującego: <strong>" +
            silaPierwszegoRycerza + "</strong></p>" +
            "<p>Twoja siła: <strong>" +
            silaDrugiegoRycerza + "</strong></p>" +
            "<hr>" +
            "<p>Teraz wybierz swoje żetony.</p>";

        document.getElementById("zatwierdz-wybor-pojedynku").style.display =
            "block";

        document.getElementById("rezygnuje-z-zetonow-pojedynku").style.display =
            "block";

        pokazEkran("ekran-zetonow-pojedynku");
    });

// PRZEJŚCIE DO DRUGIEGO GRACZA

// REZYGNACJA Z ŻETONÓW

document.getElementById("rezygnuje-z-zetonow-pojedynku")
    .addEventListener("click", () => {

        document.querySelectorAll(
            "#ekran-zetonow-pojedynku .wybrany"
        ).forEach(zeton => {
            zeton.classList.remove("wybrany");
        });

        zatwierdzWyborPojedynku();
    });

// KOLEJ DRUGIEGO RYCERZA

document.getElementById("kolej-przeciwnika")
    .addEventListener("click", () => {

        document.getElementById("kolej-przeciwnika").style.display = "none";

        if (silaPierwszegoRycerza === 0) {
            losujSileAtaku(1);
        } else {
            losujSileAtaku(2);
        }
    });

// POWRÓT Z WYBORU ŻETONÓW DO GRY

document.getElementById("powrot-z-zetonow-pojedynku")
    .addEventListener("click", () => {

        pokazEkran("ekran-gry");
        wynik.textContent = "🟢 NFC aktywne — przyłóż kolejny tag.";
    });

// POWRÓT Z POJEDYNKU DO GRY

document.getElementById("powrot-pojedynku")
    .addEventListener("click", () => {

        zatrzymajVideo();
        video.onended = null;
        video.onerror = null;

        document.getElementById("kolej-przeciwnika").style.display = "none";
        document.getElementById("oblicz-pojedynek").style.display = "none";

        pokazEkran("ekran-gry");
        wynik.textContent = "🟢 NFC aktywne — przyłóż kolejny tag.";
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

// ROZPOCZĘCIE NASTĘPNEJ RUNDY FINAŁU

document.getElementById("nastepna-runda-finalu")
    .addEventListener("click", () => {

        numerRundyFinal++;

        silaSmoka = 0;
        silaRycerzaFinal = 0;
        ogienSmoka = 0;

        document.getElementById("numer-rundy").textContent =
            numerRundyFinal;

        document.getElementById("nastepna-runda-finalu").style.display = "none";

        document.getElementById("wynik-finalu").innerHTML =
            "<h2>🐉 RUNDA " + numerRundyFinal + "</h2>" +
            "<p>Smok ponownie przygotowuje się do walki!</p>" +
            "<p>Rozpocznij losowanie jego siły.</p>";

        document.getElementById("losuj-sile-smoka").style.display = "block";

    });

// POWRÓT DO GRY PO PRZEGRANEJ ZE SMOKIEM

document.getElementById("zakoncz-przegrana-finalu")
    .addEventListener("click", () => {

        // Wyzerowanie wyników finału
        punktyRycerzaFinal = 0;
        punktySmokaFinal = 0;
        numerRundyFinal = 1;

        silaSmoka = 0;
        silaRycerzaFinal = 0;
        ogienSmoka = 0;

        wybranyKolorRycerza = null;

        // Aktualizacja tablicy punktów
        document.getElementById("punkty-rycerza").textContent = "0";
        document.getElementById("punkty-smoka").textContent = "0";
        document.getElementById("numer-rundy").textContent = "1";

        // Przygotowanie ekranu do kolejnej walki
        document.getElementById("wybor-koloru-rycerza").style.display = "block";

        document.getElementById("rozpocznij-walke-smokiem").style.display = "none";
        document.getElementById("losuj-sile-smoka").style.display = "none";
        document.getElementById("losuj-sile-rycerza-final").style.display = "none";
        document.getElementById("losuj-ogien-smoka").style.display = "none";
        document.getElementById("przejdz-do-zetonow-finalu").style.display = "none";
        document.getElementById("nastepna-runda-finalu").style.display = "none";
        document.getElementById("zakoncz-przegrana-finalu").style.display = "none";

        document.getElementById("wynik-finalu").textContent =
            "Przygotuj się do walki!";

        // Powrót do planszy
        pokazEkran("ekran-gry");

    });

// WYBÓR KOLORU RYCERZA DO FINAŁU

console.log("KOD FINAŁU ZAŁADOWANY");
console.log("LICZBA PRZYCISKÓW RYCERZY:", document.querySelectorAll("[data-rycerz]").length);
let wybranyKolorRycerza = null;

// ZMIENNE WALKI ZE SMOKIEM

let silaSmoka = 0;
let silaRycerzaFinal = 0;
let ogienSmoka = 0;

let punktyRycerzaFinal = 0;
let punktySmokaFinal = 0;
let numerRundyFinal = 1;

document.querySelectorAll("[data-rycerz]").forEach(button => {
    button.addEventListener("click", () => {
console.log("KLIKNIĘTO RYCERZA:", button.dataset.rycerz);
        wybranyKolorRycerza = button.dataset.rycerz;

        document.getElementById("wynik-finalu").textContent =
            "Wybrany rycerz: " + wybranyKolorRycerza.toUpperCase() +
            ". Przygotuj się do walki ze smokiem!";
   document.getElementById("rozpocznij-walke-smokiem").style.display = "block";
    });
});

// ROZPOCZĘCIE WALKI ZE SMOKIEM

document.getElementById("rozpocznij-walke-smokiem")
    .addEventListener("click", () => {

        punktyRycerzaFinal = 0;
        punktySmokaFinal = 0;
        numerRundyFinal = 1;

        document.getElementById("punkty-rycerza").textContent = "0";
        document.getElementById("punkty-smoka").textContent = "0";
        document.getElementById("numer-rundy").textContent = "1";

        document.getElementById("wybor-koloru-rycerza").style.display = "none";
        document.getElementById("rozpocznij-walke-smokiem").style.display = "none";

        document.getElementById("wynik-finalu").innerHTML =
            "<h2>🐉 RUNDA 1</h2>" +
            "<p>Smok przygotowuje się do walki!</p>" +
            "<p>Za chwilę wylosujemy jego siłę.</p>";
  document.getElementById("losuj-sile-smoka").style.display = "block";
    });

// LOSOWANIE SIŁY SMOKA

document.getElementById("losuj-sile-smoka")
    .addEventListener("click", () => {

        silaSmoka = Math.floor(Math.random() * 5) + 1;

        document.getElementById("losuj-sile-smoka").style.display = "none";

        document.getElementById("wynik-finalu").innerHTML =
            "<h2>🐉 SMOK LOSUJE SIŁĘ!</h2>" +
            "<p>Trwa przygotowanie ataku smoka...</p>";

        console.log("Wylosowana siła smoka:", silaSmoka);
   const adresFilmuSmoka = filmySilyAtaku[silaSmoka - 1];

video.pause();
video.onended = null;
video.onerror = null;

video.src = adresFilmuSmoka;
video.loop = false;
video.controls = false;
video.muted = false;
video.classList.add("odtwarzanie");

video.onended = () => {
    video.classList.remove("odtwarzanie");
    video.pause();
    video.removeAttribute("src");
    video.load();

    document.getElementById("wynik-finalu").innerHTML =
        "<h2>🐉 SIŁA SMOKA: " + silaSmoka + "</h2>" +
        "<p>Teraz kolej na rycerza!</p>";
document.getElementById("losuj-sile-rycerza-final").style.display = "block";
};

video.play().catch(error => {
    console.log("Błąd filmu smoka:", error);
});
    });

// LOSOWANIE SIŁY RYCERZA W FINALE

document.getElementById("losuj-sile-rycerza-final")
    .addEventListener("click", () => {

        silaRycerzaFinal = Math.floor(Math.random() * 5) + 1;

        document.getElementById("losuj-sile-rycerza-final").style.display = "none";

        document.getElementById("wynik-finalu").innerHTML =
            "<h2>⚔️ RYCERZ LOSUJE SIŁĘ!</h2>" +
            "<p>Trwa losowanie siły rycerza...</p>";

        console.log("Wylosowana siła rycerza:", silaRycerzaFinal);
    
        // LOSOWANIE OGNIA SMOKA W FINALE

document.getElementById("losuj-ogien-smoka")
    .addEventListener("click", () => {

        ogienSmoka = Math.floor(Math.random() * 3);

        document.getElementById("losuj-ogien-smoka").style.display = "none";

        document.getElementById("wynik-finalu").innerHTML =
            "<h2>🔥 SMOK ZIEJE OGNIEM!</h2>" +
            "<p>Trwa losowanie siły ognia...</p>";

        console.log("Wylosowana siła ognia:", ogienSmoka);

        // ODTWARZANIE FILMU OGNIA SMOKA

const adresFilmuOgnia = filmyOgniaSmoka[ogienSmoka];

video.pause();
video.onended = null;
video.onerror = null;

video.src = adresFilmuOgnia;
video.loop = false;
video.controls = false;
video.muted = false;
video.classList.add("odtwarzanie");

video.onended = () => {
    video.classList.remove("odtwarzanie");
    video.pause();
    video.removeAttribute("src");
    video.load();

    let opisOgnia = "";

    if (ogienSmoka === 0) {
        opisOgnia = "🛡️ Rycerz uniknął ognia!";
    } else if (ogienSmoka === 1) {
        opisOgnia = "🔥 Rycerz został lekko osmalony!";
    } else {
        opisOgnia = "🔥🔥 Rycerz otrzymał potężny podmuch ognia!";
    }

    document.getElementById("wynik-finalu").innerHTML =
        "<h2>🐉 SIŁA SMOKA: " + silaSmoka + "</h2>" +
        "<h2>⚔️ SIŁA RYCERZA: " + silaRycerzaFinal + "</h2>" +
        "<h2>🔥 SIŁA OGNIA: " + ogienSmoka + "</h2>" +
        "<p>" + opisOgnia + "</p>" +
        "<hr>" +
        "<p>Teraz czas na wybór żetonów rycerza!</p>";
document.getElementById("przejdz-do-zetonow-finalu").style.display = "block";
};

video.play().catch(error => {
    console.log("Błąd filmu ognia smoka:", error);
});
    });
        
        // FILM LOSOWANIA SIŁY RYCERZA W FINALE

const adresFilmuRycerza = filmySilyAtaku[silaRycerzaFinal - 1];

video.pause();
video.onended = null;
video.onerror = null;

video.src = adresFilmuRycerza;
video.loop = false;
video.controls = false;
video.muted = false;
video.classList.add("odtwarzanie");

video.onended = () => {
    video.classList.remove("odtwarzanie");
    video.pause();
    video.removeAttribute("src");
    video.load();

    document.getElementById("wynik-finalu").innerHTML =
        "<h2>⚔️ SIŁA RYCERZA: " + silaRycerzaFinal + "</h2>" +
        "<p>🐉 Siła smoka: " + silaSmoka + "</p>" +
        "<hr>" +
        "<p>Teraz smok przygotowuje ognisty atak!</p>";
document.getElementById("losuj-ogien-smoka").style.display = "block";
};

video.play().catch(error => {
    console.log("Błąd filmu rycerza w finale:", error);
});
    });

// PRZEJŚCIE DO WYBORU ŻETONÓW W FINALE

document.getElementById("przejdz-do-zetonow-finalu")
    .addEventListener("click", () => {

        document.getElementById("przejdz-do-zetonow-finalu").style.display = "none";

        document.getElementById("wynik-rundy").innerHTML =
            "<h2>⚔️ RUNDA " + numerRundyFinal + "</h2>" +
            "<p>🐉 Siła smoka z ogniem: " + (silaSmoka + ogienSmoka) + "</p>" +
            "<p>⚔️ Siła rycerza: " + silaRycerzaFinal + "</p>" +
            "<p>Wybierz żetony, których chcesz użyć.</p>";
        pokazZetonyFinalu();
        pokazEkran("ekran-zetonow-finalu");
    });

// ZATWIERDZANIE ŻETONÓW W WALCE ZE SMOKIEM

document.getElementById("zatwierdz-zetony")
    .addEventListener("click", () => {

        const wybraneZetony = Array.from(
            document.querySelectorAll(
                "#ekran-zetonow-finalu .zeton-wyboru.wybrany"
            )
        ).map(zeton => ({
            typ: zeton.dataset.typ,
            wartosc: Number(zeton.dataset.wartosc)
        }));

        console.log("Żetony wybrane do walki ze smokiem:", wybraneZetony);

        // OBLICZANIE SIŁY W FINALE

let wynikRycerza = silaRycerzaFinal;

wybraneZetony.forEach(zeton => {
    wynikRycerza += zeton.wartosc;
});

const wynikSmoka = silaSmoka + ogienSmoka;

console.log("Łączna siła rycerza:", wynikRycerza);
console.log("Łączna siła smoka:", wynikSmoka);
    
        // USTALENIE ZWYCIĘZCY RUNDY

if (wynikRycerza > wynikSmoka) {
    punktyRycerzaFinal++;
    console.log("Rundę wygrał RYCERZ!");
} else {
    punktySmokaFinal++;
    console.log("Rundę wygrał SMOK!");
}
        // AKTUALIZACJA PUNKTACJI FINAŁU

document.getElementById("punkty-rycerza").textContent =
    punktyRycerzaFinal;

document.getElementById("punkty-smoka").textContent =
    punktySmokaFinal;
   
        // WYŚWIETLENIE WYNIKU RUNDY

const zwyciezcaRundy =
    wynikRycerza > wynikSmoka ? "⚔️ RYCERZ" : "🐉 SMOK";

document.getElementById("wynik-finalu").innerHTML =
    "<h2>⚔️ WYNIK RUNDY " + numerRundyFinal + "</h2>" +
    "<p>🐉 Siła smoka z ogniem: " + wynikSmoka + "</p>" +
    "<p>⚔️ Siła rycerza z żetonami: " + wynikRycerza + "</p>" +
    "<hr>" +
    "<h2>🏆 RUNDĘ WYGRYWA: " + zwyciezcaRundy + "</h2>" +
    "<p>⚔️ Rycerz: " + punktyRycerzaFinal +
    " | 🐉 Smok: " + punktySmokaFinal + "</p>";

pokazEkran("ekran-finalu");
    });

// POWRÓT Z WYBORU ŻETONÓW FINAŁU

document.getElementById("powrot-z-zetonow-finalu")
    .addEventListener("click", () => {

        pokazEkran("ekran-gry");
        wynik.textContent = "🟢 NFC aktywne — przyłóż kolejny tag.";
    });

// POWRÓT Z FINAŁU DO GRY

document.getElementById("powrot-finalu")
    .addEventListener("click", () => {

        zatrzymajVideo();
        video.onended = null;
        video.onerror = null;

        pokazEkran("ekran-gry");
        wynik.textContent = "🟢 NFC aktywne — przyłóż kolejny tag.";
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

// DŹWIĘK KLIKNIĘCIA PRZYCISKÓW

document.addEventListener("click", (event) => {
    if (event.target.closest("button")) {
        const dzwiekKlik = new Audio("dzwieki/klik.wav");
        dzwiekKlik.play().catch(() => {});
    }
});
