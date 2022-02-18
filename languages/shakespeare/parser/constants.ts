/** Regex bit to accommodate line breaks in multi-word keywords */
const br = /(?: |\s*\n\s*)/.source;

/** Utility to create regex from list of words */
const makeRegex = (words: string[], flags?: string) => {
  const fixedWords = words.map((w) => w.replace(/ /g, br));
  const pattern = "(" + fixedWords.join("|") + ")\\b";
  return new RegExp(pattern, flags);
};

// prettier-ignore
const CHARACTERS = ["Achilles", "Adonis", "Adriana", "Aegeon", "Aemilia", "Agamemnon", "Agrippa", "Ajax", "Alonso", "Andromache",
"Angelo", "Antiochus", "Antonio", "Arthur", "Autolycus", "Balthazar", "Banquo", "Beatrice", "Benedick", "Benvolio", "Bianca",
"Brabantio", "Brutus", "Capulet", "Cassandra", "Cassius", "Christopher Sly", "Cicero", "Claudio", "Claudius", "Cleopatra",
"Cordelia", "Cornelius", "Cressida", "Cymberline", "Demetrius", "Desdemona", "Dionyza", "Doctor Caius", "Dogberry", "Don John",
"Don Pedro", "Donalbain", "Dorcas", "Duncan", "Egeus", "Emilia", "Escalus", "Falstaff", "Fenton", "Ferdinand", "Ford", "Fortinbras",
"Francisca", "Friar John", "Friar Laurence", "Gertrude", "Goneril", "Hamlet", "Hecate", "Hector", "Helen", "Helena", "Hermia",
"Hermonie", "Hippolyta", "Horatio", "Imogen", "Isabella", "John of Gaunt", "John of Lancaster", "Julia", "Juliet", "Julius Caesar",
"King Henry", "King John", "King Lear", "King Richard", "Lady Capulet", "Lady Macbeth", "Lady Macduff", "Lady Montague", "Lennox",
"Leonato", "Luciana", "Lucio", "Lychorida", "Lysander", "Macbeth", "Macduff", "Malcolm", "Mariana", "Mark Antony", "Mercutio",
"Miranda", "Mistress Ford", "Mistress Overdone", "Mistress Page", "Montague", "Mopsa", "Oberon", "Octavia", "Octavius Caesar",
"Olivia", "Ophelia", "Orlando", "Orsino", "Othello", "Page", "Pantino", "Paris", "Pericles", "Pinch", "Polonius", "Pompeius",
"Portia", "Priam", "Prince Henry", "Prospero", "Proteus", "Publius", "Puck", "Queen Elinor", "Regan", "Robin", "Romeo", "Rosalind",
"Sebastian", "Shallow", "Shylock", "Slender", "Solinus", "Stephano", "Thaisa", "The Abbot of Westminster", "The Apothecary",
"The Archbishop of Canterbury", "The Duke of Milan", "The Duke of Venice", "The Ghost", "Theseus", "Thurio", "Timon", "Titania",
"Titus", "Troilus", "Tybalt", "Ulysses", "Valentine", "Venus", "Vincentio", "Viola"]

/** Regex that matches an identified character name */
export const CharacterRegex = makeRegex(CHARACTERS, "i");

// prettier-ignore
const NEGATIVE_ADJECTIVE = ["bad","cowardly","cursed","damned","dirty","disgusting", "distasteful","dusty","evil","fat-kidneyed",
"fat","fatherless","foul","hairy","half-witted", "horrible","horrid","infected","lying","miserable","misused",
"oozing","rotten","rotten","smelly","snotty","sorry", "stinking","stuffed","stupid","vile","villainous","worried"]

/** Regex that matches a negative adjective */
export const NegativeAdjectiveRegex = makeRegex(NEGATIVE_ADJECTIVE, "i");

// prettier-ignore
const NEGATIVE_NOUNS = ["Hell","Microsoft","bastard","beggar","blister","codpiece","coward","curse","death","devil","draught",
"famine","flirt-gill","goat","hate","hog","hound","leech","lie","pig","plague","starvation","toad","war","wolf"];

/** Regex that matches a negative noun */
export const NegativeNounRegex = makeRegex(NEGATIVE_NOUNS, "i");

// prettier-ignore
const NEUTRAL_ADJECTIVES = ["big","black","blue","bluest","bottomless","furry","green","hard","huge","large","little",
"normal","old","purple","red","rural","small","tiny","white","yellow"];

/** Regex that matches a neutral adjective */
export const NeutralAdjectiveRegex = makeRegex(NEUTRAL_ADJECTIVES, "i");

// prettier-ignore
const NEUTRAL_NOUNS = ["animal","aunt","brother","cat","chihuahua","cousin","cow","daughter","door","face","father",
"fellow","granddaughter","grandfather","grandmother","grandson","hair","hamster","horse","lamp","lantern","mistletoe",
"moon","morning","mother","nephew","niece","nose","purse","road","roman","sister","sky","son","squirrel","stone wall",
"thing","town","tree","uncle","wind"]

/** Regex that matches a neutral noun */
export const NeutralNounRegex = makeRegex(NEUTRAL_NOUNS, "i");

// prettier-ignore
const POSITIVE_ADJECTIVES = ["amazing","beautiful","blossoming","bold","brave","charming","clearest","cunning","cute",
"delicious","embroidered","fair","fine","gentle","golden","good","handsome","happy","healthy","honest","lovely","loving",
"mighty","noble","peaceful","pretty","prompt","proud","reddest","rich","smooth","sunny","sweet","sweetest","trustworthy","warm"]

/** Regex that matches a positive adjective */
export const PositiveAdjectiveRegex = makeRegex(POSITIVE_ADJECTIVES, "i");

// prettier-ignore
const POSITIVE_NOUN = ["Heaven","King","Lord","angel","flower","happiness","joy","plum","summer's day","hero","rose","kingdom","pony"]

/** Regex that matches a positive noun */
export const PositiveNounRegex = makeRegex(POSITIVE_NOUN, "i");
