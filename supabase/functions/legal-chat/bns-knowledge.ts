// Bharatiya Nyaya Sanhita (BNS) 2023 Knowledge Base
// This replaces the Indian Penal Code (IPC), 1860
// Effective from: Date notified by Central Government

export const BNS_KNOWLEDGE = {
  name: "Bharatiya Nyaya Sanhita, 2023",
  shortName: "BNS 2023",
  replacedLaw: "Indian Penal Code (IPC), 1860",
  act: "Act No. 45 of 2023",
  assent: "25th December, 2023",
  
  chapters: {
    I: {
      title: "PRELIMINARY",
      sections: {
        1: "Short title, commencement and application",
        2: "Definitions",
        3: "General explanations"
      }
    },
    II: {
      title: "OF PUNISHMENTS",
      sections: {
        4: "Punishments - Death, Imprisonment for life, Rigorous/Simple imprisonment, Forfeiture of property, Fine, Community Service",
        5: "Commutation of sentence",
        6: "Fractions of terms of punishment",
        7: "Sentence may be wholly or partly rigorous or simple in certain cases",
        8: "Amount of fine, liability in default of payment",
        9: "Limit of punishment of offence made up of several offences",
        10: "Punishment of person guilty of one of several offences",
        11: "Solitary confinement",
        12: "Limit of solitary confinement",
        13: "Enhanced punishment for certain offences after previous conviction"
      }
    },
    III: {
      title: "GENERAL EXCEPTIONS",
      sections: {
        14: "Act done by person bound by law or by mistake of fact believing himself bound",
        15: "Act of Judge when acting judicially",
        16: "Act done pursuant to judgment or order of Court",
        17: "Act done by person justified or by mistake of fact believing justified",
        18: "Accident in doing a lawful act",
        19: "Act likely to cause harm but done without criminal intent to prevent other harm",
        20: "Act of a child under seven years of age - No criminal liability",
        21: "Act of child above seven and under twelve of immature understanding",
        22: "Act of person of unsound mind",
        23: "Act of person incapable of judgment by reason of intoxication caused against his will",
        24: "Offence requiring particular intent/knowledge committed by intoxicated person",
        25: "Act not intended and not known to be likely to cause death/grievous hurt done by consent",
        26: "Act not intended to cause death done by consent in good faith for person's benefit",
        27: "Act done in good faith for benefit of child/unsound mind person by consent of guardian",
        28: "Consent known to be given under fear or misconception",
        29: "Exclusion of acts which are offences independently of harm caused",
        30: "Act done in good faith for benefit of person without consent",
        31: "Communication made in good faith",
        32: "Act to which person is compelled by threats (except murder)",
        33: "Act causing slight harm",
        34: "Things done in private defence",
        35: "Right of private defence of body and property",
        36: "Right against act of unsound mind person",
        37: "Acts against which there is no right of private defence",
        38: "When right extends to causing death",
        39: "When right extends to causing harm other than death",
        40: "Commencement and continuance of right of private defence of body",
        41: "When right of property extends to causing death",
        42: "When right extends to causing harm other than death for property",
        43: "Commencement and continuance of right of private defence of property",
        44: "Right against deadly assault when there is risk of harm to innocent person"
      }
    },
    IV: {
      title: "OF ABETMENT, CRIMINAL CONSPIRACY AND ATTEMPT",
      sections: {
        45: "Abetment of a thing - instigation, conspiracy, intentional aiding",
        46: "Abettor defined",
        47: "Abetment in India of offences outside India",
        48: "Abetment outside India for offence in India",
        49: "Punishment of abetment if act abetted is committed",
        50: "Punishment if person abetted does act with different intention",
        51: "Liability when one act abetted and different act done",
        52: "Abettor liable to cumulative punishment",
        53: "Liability for effect different from intended",
        54: "Abettor present when offence committed",
        55: "Abetment of offence punishable with death or life imprisonment",
        56: "Abetment of offence punishable with imprisonment",
        57: "Abetting commission of offence by public or more than ten persons",
        58: "Concealing design to commit capital offence",
        59: "Public servant concealing design to commit offence",
        60: "Criminal conspiracy defined",
        61: "Punishment of criminal conspiracy",
        62: "Attempt to commit offence punishable with life imprisonment or other offences"
      }
    },
    V: {
      title: "OF OFFENCES AGAINST WOMAN AND CHILD",
      description: "Sexual offences, criminal force and assault against woman, offences relating to marriage, miscarriage, and child protection",
      keyOffences: {
        rape: {
          sections: [63, 64, 65, 66],
          description: "Rape and its punishments including gang rape"
        },
        sexualHarassment: {
          section: 75,
          description: "Sexual harassment at workplace and public places"
        },
        dowryDeath: {
          section: 80,
          description: "Dowry death - death of woman within 7 years of marriage under abnormal circumstances"
        },
        cruelty: {
          section: 85,
          description: "Husband or relative subjecting woman to cruelty"
        },
        childOffences: {
          sections: [93, 94, 95, 96, 97],
          description: "Offences against children including abandonment, hiring for offences, procuration"
        }
      }
    },
    VI: {
      title: "OF OFFENCES AFFECTING THE HUMAN BODY",
      sections: {
        culpableHomicide: {
          section: 100,
          description: "Causing death with intention or knowledge that act likely to cause death"
        },
        murder: {
          section: 101,
          description: "Culpable homicide is murder if done with intention to cause death or bodily injury likely to cause death"
        },
        murderPunishment: {
          section: 103,
          description: "Death or imprisonment for life, and fine"
        },
        hurt: {
          sections: [114, 115, 116, 117],
          description: "Hurt and grievous hurt - voluntary causing"
        },
        acidAttack: {
          section: 124,
          description: "Voluntarily causing grievous hurt by use of acid - 10 years to life imprisonment"
        },
        wrongfulConfinement: {
          sections: [126, 127],
          description: "Wrongful restraint and confinement"
        },
        kidnapping: {
          sections: [137, 138, 139, 140],
          description: "Kidnapping and abduction offences"
        },
        trafficking: {
          section: 143,
          description: "Trafficking of person"
        },
        organisedCrime: {
          section: 111,
          description: "Organised crime - NEW in BNS"
        },
        terroristAct: {
          section: 113,
          description: "Terrorist act - NEW in BNS"
        }
      }
    },
    VII: {
      title: "OF OFFENCES AGAINST THE STATE",
      sections: {
        147: "Waging war against Government of India",
        148: "Conspiracy to commit offences under section 147",
        149: "Collecting arms with intention of waging war",
        150: "Concealing with intent to facilitate design to wage war",
        151: "Assaulting President, Governor with intent to compel",
        152: "Act endangering sovereignty, unity and integrity of India"
      }
    },
    IX: {
      title: "OF OFFENCES RELATING TO ELECTIONS",
      sections: {
        170: "Bribery",
        171: "Undue influence at elections",
        172: "Personation at elections",
        173: "Punishment for bribery",
        174: "Punishment for undue influence or personation"
      }
    },
    XI: {
      title: "OF OFFENCES AGAINST THE PUBLIC TRANQUILLITY",
      sections: {
        189: "Unlawful assembly - 5 or more persons with common object",
        190: "Every member of unlawful assembly guilty of offence",
        191: "Rioting",
        194: "Affray",
        196: "Promoting enmity between different groups",
        197: "Imputations prejudicial to national integration"
      }
    },
    XIV: {
      title: "OF FALSE EVIDENCE AND OFFENCES AGAINST PUBLIC JUSTICE",
      sections: {
        229: "Giving false evidence",
        230: "Fabricating false evidence",
        231: "Punishment for false evidence",
        242: "Causing disappearance of evidence",
        248: "False charge of offence with intent to injure"
      }
    },
    XV: {
      title: "OF OFFENCES AFFECTING PUBLIC HEALTH, SAFETY, CONVENIENCE, DECENCY AND MORALS",
      sections: {
        270: "Public nuisance",
        271: "Negligent act likely to spread infection",
        272: "Malignant act likely to spread infection",
        281: "Rash driving or riding on public way",
        292: "Sale of obscene material"
      }
    },
    XVII: {
      title: "OF OFFENCES AGAINST PROPERTY",
      sections: {
        theft: {
          section: 303,
          description: "Theft - dishonestly taking movable property"
        },
        snatching: {
          section: 304,
          description: "Snatching - NEW offence in BNS"
        },
        extortion: {
          section: 308,
          description: "Extortion - putting person in fear to deliver property"
        },
        robbery: {
          section: 309,
          description: "Robbery - theft with force or fear"
        },
        dacoity: {
          section: 310,
          description: "Dacoity - robbery by 5 or more persons"
        },
        cheating: {
          section: 318,
          description: "Cheating - deceiving person to deliver property"
        },
        mischief: {
          section: 324,
          description: "Mischief - destroying or diminishing property value"
        },
        criminalTrespass: {
          section: 329,
          description: "Criminal trespass and house-trespass"
        }
      }
    },
    XVIII: {
      title: "OF OFFENCES RELATING TO DOCUMENTS AND PROPERTY MARKS",
      sections: {
        336: "Making a false document",
        337: "Forgery",
        338: "Forgery of record of Court or public register",
        340: "Having possession of forged document",
        344: "Falsification of accounts"
      }
    },
    XIX: {
      title: "OF CRIMINAL INTIMIDATION, INSULT, ANNOYANCE, DEFAMATION",
      sections: {
        351: "Criminal intimidation",
        352: "Intentional insult to provoke breach of peace",
        356: "Defamation"
      }
    }
  },
  
  newProvisions: [
    "Community Service as punishment (Section 4)",
    "Organised Crime (Section 111)",
    "Petty Organised Crime (Section 112)",
    "Terrorist Act (Section 113)",
    "Snatching as distinct offence (Section 304)",
    "Electronic record included in document definition",
    "Gender-neutral provisions with transgender recognition",
    "Act endangering sovereignty, unity and integrity of India (Section 152) replacing Sedition",
    "Mob lynching addressed under murder provisions"
  ],
  
  deletedProvisions: [
    "Section 377 IPC (Unnatural offences) - Decriminalized by Supreme Court",
    "Section 124A IPC (Sedition) - Replaced with Section 152 BNS",
    "Section 497 IPC (Adultery) - Declared unconstitutional"
  ],
  
  keyDefinitions: {
    child: "Any person below the age of eighteen years (Section 2(3))",
    document: "Any matter expressed upon substance by letters, figures, marks including electronic and digital record (Section 2(8))",
    dishonestly: "Doing anything with intention of causing wrongful gain or wrongful loss (Section 2(7))",
    voluntarily: "Causing effect by means intended or known likely to cause it (Section 2(33))",
    goodFaith: "Nothing is done in good faith without due care and attention (Section 2(11))",
    publicServant: "Includes all government officers, judges, police, army personnel (Section 2(28))",
    wrongfulGain: "Gain by unlawful means of property not legally entitled (Section 2(36))",
    wrongfulLoss: "Loss by unlawful means of property legally entitled (Section 2(37))"
  },
  
  punishments: {
    death: "Capital punishment - For murder, terrorist acts, waging war",
    lifeImprisonment: "Imprisonment for remainder of natural life",
    rigorousImprisonment: "Imprisonment with hard labour",
    simpleImprisonment: "Imprisonment without hard labour",
    fine: "Monetary penalty - no upper limit unless specified",
    communityService: "NEW - Service for benefit of community as directed by court",
    forfeiture: "Forfeiture of property to State"
  },
  
  privateDefence: {
    rightExists: "Every person has right to defend body and property",
    canCauseDeath: [
      "Apprehension of death from assault",
      "Apprehension of grievous hurt",
      "Assault with intention of rape",
      "Assault for kidnapping or abduction",
      "Assault for wrongful confinement",
      "Acid attack",
      "Robbery",
      "House-breaking after sunset before sunrise"
    ],
    restrictions: [
      "No right against public servant acting in good faith",
      "No right when time to approach authorities",
      "Cannot inflict more harm than necessary"
    ]
  },
  
  ipcToBnsMapping: {
    "IPC 302": "BNS 103 - Murder punishment",
    "IPC 304": "BNS 105 - Culpable homicide not amounting to murder",
    "IPC 376": "BNS 64-66 - Rape and punishments",
    "IPC 420": "BNS 318 - Cheating",
    "IPC 498A": "BNS 85 - Cruelty to woman by husband",
    "IPC 304B": "BNS 80 - Dowry death",
    "IPC 354": "BNS 74 - Assault to outrage modesty",
    "IPC 509": "BNS 79 - Word, gesture to insult modesty",
    "IPC 323": "BNS 115 - Voluntarily causing hurt",
    "IPC 324": "BNS 118 - Hurt by dangerous weapons",
    "IPC 307": "BNS 109 - Attempt to murder",
    "IPC 379": "BNS 303 - Theft",
    "IPC 392": "BNS 309 - Robbery",
    "IPC 395": "BNS 310 - Dacoity",
    "IPC 120B": "BNS 61 - Criminal conspiracy",
    "IPC 34": "BNS 3(5) - Common intention",
    "IPC 149": "BNS 190 - Unlawful assembly liability"
  }
};

export const getBNSContext = (): string => {
  return `
BHARATIYA NYAYA SANHITA (BNS) 2023 - COMPREHENSIVE KNOWLEDGE BASE

The Bharatiya Nyaya Sanhita, 2023 (BNS) replaces the Indian Penal Code (IPC), 1860. It received Presidential assent on 25th December 2023.

KEY CHANGES FROM IPC:
1. Community Service introduced as new punishment (Section 4)
2. Organised Crime and Petty Organised Crime are new offences (Sections 111-112)
3. Terrorist Act defined separately (Section 113)
4. Snatching is now a distinct offence (Section 304)
5. Sedition replaced with "Act endangering sovereignty, unity and integrity of India" (Section 152)
6. Electronic records included in document definitions
7. Transgender recognized in gender definitions
8. Mob lynching addressed

PUNISHMENTS UNDER BNS (Section 4):
- Death penalty
- Imprisonment for life
- Rigorous imprisonment (with hard labour)
- Simple imprisonment
- Forfeiture of property
- Fine
- Community Service (NEW)

IMPORTANT SECTIONS:

CHAPTER III - GENERAL EXCEPTIONS:
- Section 20: Child under 7 years cannot commit offence
- Section 21: Child 7-12 years with immature understanding
- Section 22: Person of unsound mind
- Sections 34-44: Right of Private Defence

CHAPTER V - OFFENCES AGAINST WOMAN AND CHILD:
- Section 63-66: Rape and gang rape
- Section 75: Sexual harassment
- Section 80: Dowry death
- Section 85: Cruelty by husband/relatives (like old 498A)
- Section 74: Assault to outrage modesty

CHAPTER VI - OFFENCES AFFECTING HUMAN BODY:
- Section 100: Culpable homicide
- Section 101: Murder
- Section 103: Punishment for murder (death or life imprisonment)
- Section 109: Attempt to murder
- Section 111: Organised crime (NEW)
- Section 113: Terrorist act (NEW)
- Section 124: Acid attack

CHAPTER XVII - PROPERTY OFFENCES:
- Section 303: Theft
- Section 304: Snatching (NEW)
- Section 308: Extortion
- Section 309: Robbery
- Section 310: Dacoity
- Section 318: Cheating

IPC TO BNS QUICK REFERENCE:
- IPC 302 (Murder) → BNS 103
- IPC 376 (Rape) → BNS 64-66
- IPC 420 (Cheating) → BNS 318
- IPC 498A (Cruelty) → BNS 85
- IPC 304B (Dowry death) → BNS 80
- IPC 379 (Theft) → BNS 303
- IPC 307 (Attempt to murder) → BNS 109
- IPC 120B (Conspiracy) → BNS 61
- IPC 34 (Common intention) → BNS 3(5)

PRIVATE DEFENCE (Sections 34-44):
Can cause death in self-defence when:
- Fear of death or grievous hurt
- Assault with intention of rape
- Kidnapping or abduction attempt
- Acid attack
- Robbery
- House-breaking at night

Cannot exercise private defence:
- Against public servant acting in good faith
- When time to approach authorities
- More harm than necessary

Remember: BNS uses modern language and includes provisions for cyber crimes and electronic records.
`;
};
