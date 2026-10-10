import { Book, VocabularyItem, DifficultyLevel } from './types';

export interface DictEntry {
  word: string;
  phonetic: string;
  pos: string;
  translation: string;
  englishDef?: string;
  level?: DifficultyLevel;
  collocations?: string[];
}

export const DICTIONARY_DATABASE: Record<string, DictEntry> = {
  vulnerable: {
    word: 'vulnerable',
    phonetic: '/ˈvʌlnərəbl/',
    pos: 'adj.',
    translation: '脆弱的；易受伤害的；（心智阅历）浅薄稚嫩的',
    englishDef: 'Susceptible to physical or emotional attack or harm.',
    level: 'CET6',
    collocations: ['vulnerable to', 'highly vulnerable', 'vulnerable group']
  },
  criticizing: {
    word: 'criticize',
    phonetic: '/ˈkrɪtɪsaɪz/',
    pos: 'v.',
    translation: '批评；非难；挑剔',
    englishDef: 'Indicate the faults of (someone or something) in a disapproving way.',
    level: 'CET4',
    collocations: ['feel like criticizing', 'severely criticize']
  },
  advantages: {
    word: 'advantage',
    phonetic: '/ədˈvɑːntɪdʒ/',
    pos: 'n.',
    translation: '有利条件；优势；优越特权',
    englishDef: 'A condition or circumstance that puts one in a favorable or superior position.',
    level: 'CET4',
    collocations: ['take advantage of', 'have the advantages']
  },
  unusually: {
    word: 'unusually',
    phonetic: '/ʌnˈjuːʒuəli/',
    pos: 'adv.',
    translation: '不同寻常地；罕见地；异常地',
    englishDef: 'In a way that is not normal, typical, or usual.',
    level: 'CET4'
  },
  communicative: {
    word: 'communicative',
    phonetic: '/kəˈmjuːnɪkətɪv/',
    pos: 'adj.',
    translation: '畅所欲言的；坦诚的；乐意沟通的',
    englishDef: 'Ready to talk or impart information.',
    level: 'CET6'
  },
  reserved: {
    word: 'reserved',
    phonetic: '/rɪˈzɜːvd/',
    pos: 'adj.',
    translation: '内敛的；矜持的；话语有所保留的',
    englishDef: 'Slow to reveal emotion or opinions.',
    level: 'CET6',
    collocations: ['in a reserved way', 'reserved personality']
  },
  consequence: {
    word: 'consequence',
    phonetic: '/ˈkɒnsɪkwəns/',
    pos: 'n.',
    translation: '结果；后果；重要性',
    englishDef: 'A result or effect of an action or condition.',
    level: 'CET4',
    collocations: ['in consequence', 'as a consequence of']
  },
  inclined: {
    word: 'inclined',
    phonetic: '/ɪnˈklaɪnd/',
    pos: 'adj.',
    translation: '倾向于...的；赞同...的',
    englishDef: 'Willing or favorably disposed.',
    level: 'CET6',
    collocations: ['be inclined to', 'inclined to think']
  },
  judgements: {
    word: 'judgement',
    phonetic: '/ˈdʒʌdʒmənt/',
    pos: 'n.',
    translation: '判断；评价；裁判意见',
    englishDef: 'The ability to make considered decisions or come to sensible conclusions.',
    level: 'CET4',
    collocations: ['reserve judgement', 'make a judgement']
  },
  curious: {
    word: 'curious',
    phonetic: '/ˈkjʊəriəs/',
    pos: 'adj.',
    translation: '好奇的；奇特古怪的；不寻常的',
    englishDef: 'Eager to know or learn something; strange; unusual.',
    level: 'CET4',
    collocations: ['curious nature', 'curious about']
  },
  victim: {
    word: 'victim',
    phonetic: '/ˈvɪktɪm/',
    pos: 'n.',
    translation: '受害者；牺牲品',
    englishDef: 'A person harmed, injured, or made to suffer as a result of a crime, accident, or other event.',
    level: 'CET4',
    collocations: ['fall victim to', 'the victim of']
  },
  veteran: {
    word: 'veteran',
    phonetic: '/ˈvetərən/',
    pos: 'adj. / n.',
    translation: '经验老到的；老手；习惯性的',
    englishDef: 'Having a great deal of experience in a particular field.',
    level: 'GRE',
    collocations: ['veteran bores', 'war veteran']
  },
  bores: {
    word: 'bore',
    phonetic: '/bɔː(r)/',
    pos: 'n.',
    translation: '令人厌烦的人；啰嗦冗长之辈',
    englishDef: 'A dull, tiresome, or unwelcome person or thing.',
    level: 'GRE',
    collocations: ['veteran bores', 'utter bore']
  },
  abnormal: {
    word: 'abnormal',
    phonetic: '/æbˈnɔːml/',
    pos: 'adj.',
    translation: '反常的；怪异的；畸形的',
    englishDef: 'Deviating from what is normal or usual, typically in a way that is undesirable.',
    level: 'CET6'
  },
  attach: {
    word: 'attach',
    phonetic: '/əˈtætʃ/',
    pos: 'v.',
    translation: '粘附；依附；连接',
    englishDef: 'Join or fasten (something) to something else.',
    level: 'CET4',
    collocations: ['attach itself to', 'attach importance to']
  },
  unjustly: {
    word: 'unjustly',
    phonetic: '/ʌnˈdʒʌstli/',
    pos: 'adv.',
    translation: '不公道地；非正义地；无端地',
    englishDef: 'In an unfair manner.',
    level: 'KY'
  },
  politician: {
    word: 'politician',
    phonetic: '/ˌpɒləˈtɪʃn/',
    pos: 'n.',
    translation: '从政者；圆滑世故者；玩弄权术者',
    englishDef: 'A person who is professionally involved in politics, especially as a holder of or candidate for elected office.',
    level: 'CET4'
  },
  privy: {
    word: 'privy',
    phonetic: '/ˈprɪvi/',
    pos: 'adj.',
    translation: '私下知情的；准许获知秘密的',
    englishDef: 'Sharing in the knowledge of (something secret or private).',
    level: 'GRE',
    collocations: ['be privy to', 'privy council']
  },
  griefs: {
    word: 'grief',
    phonetic: '/ɡriːf/',
    pos: 'n.',
    translation: '悲伤；悲痛；深层苦闷',
    englishDef: 'Deep sorrow, especially that caused by someone\'s death or a major loss.',
    level: 'CET6',
    collocations: ['secret griefs', 'overcome with grief']
  }
};

export const SAMPLE_BOOK: Book = {
  id: 'the-great-gatsby',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  publishedYear: 1925,
  source: 'Standard Ebooks',
  chapters: [
    {
      id: 'chapter-1',
      number: 1,
      title: 'Chapter I',
      subtitle: 'In my younger and more vulnerable years...',
      stats: {
        wordCount: 1650,
        cefr: 'C1',
        fleschScore: 78.4,
        lexile: '1020L',
        levelDistribution: {
          basic: 82,
          cet4: 9,
          cet6: 5,
          gre: 4
        }
      },
      sentences: [
        {
          id: 'sent-1',
          rawText: 'In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.',
          chineseTranslation: '在我年纪还轻、阅历尚浅的那些年岁里，父亲曾给过我一句忠告，至今仍常在我心头萦绕回响。',
          difficultyTag: '长难句',
          coreKeywords: ['vulnerable', 'advice'],
          grammarComponents: [
            {
              role: '时间状语前置',
              content: 'In my younger and more vulnerable years',
              explanation: '介词短语前置作全句时间状语，奠定了叙述者追忆往昔、自省反思的情感基调。'
            },
            {
              role: '主干句 (SVOO 双宾结构)',
              content: 'my father gave me some advice',
              explanation: '核心骨干：father (主语) + gave (谓语) + me (间接宾语) + some advice (直接宾语)。'
            },
            {
              role: '限制性定语从句',
              content: 'that I’ve been turning over in my mind ever since',
              explanation: 'that 引导定语从句修饰 advice；现在完成进行时 (have been doing) 表明这种反复斟酌咀嚼的思考状态持续至今。'
            }
          ],
          culturalNote: '【文学人设奠定】这是小说极负盛名的经典开篇。作者菲茨杰拉德借尼克·卡拉威之口，确立了他冷静、审慎且带有中西部家庭教养的叙述者形象。'
        },
        {
          id: 'sent-2',
          rawText: '“Whenever you feel like criticizing any one,” he told me, “just remember that all the people in this world haven’t had the advantages that you’ve had.”',
          chineseTranslation: '“每当你想要批评任何人的时候，”他叮嘱我，“只要记住，这世上并不是所有人都拥有你所享有的优越条件。”',
          difficultyTag: '长难句',
          coreKeywords: ['criticizing', 'advantages'],
          grammarComponents: [
            {
              role: '时间/条件从句',
              content: 'Whenever you feel like criticizing any one',
              explanation: 'whenever 引导让步从句；“feel like doing” 是口语中“想要做某事”的地道表达。'
            },
            {
              role: '叙述插入语',
              content: 'he told me',
              explanation: '典型小说直接引语分隔句式，增添回忆口述的真实氛围。'
            },
            {
              role: '祈使句主句 + 宾语从句',
              content: 'just remember that all the people in this world haven’t had...',
              explanation: '动词原形 remember 引导祈使句；that 引导宾语从句。'
            },
            {
              role: '经典“部分否定”结构',
              content: 'all the people ... haven’t had',
              explanation: '【重要语法点】“all ... not” 表部分否定（并非人人都有），而不是“所有人都未曾拥有”。'
            }
          ],
          culturalNote: '【阶级与同理心】卡拉威家族是耶鲁出身的富裕名门后裔，父亲的训诫既体现了阶级教养，也埋下了后文尼克审视东部新贵盖茨比及其浮华圈子的道德标尺。'
        },
        {
          id: 'sent-3',
          rawText: 'He didn’t say any more, but we’ve always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.',
          chineseTranslation: '他没有再多说什么，但我俩之间一贯很有默契，即便克制含蓄也能深谙彼此心意，我明白他的言下之意远不仅如此。',
          difficultyTag: '中等',
          coreKeywords: ['unusually', 'communicative', 'reserved'],
          grammarComponents: [
            {
              role: '转折并列句',
              content: 'He didn’t say any more, but we’ve always been...',
              explanation: 'but 连接两个完整主谓结构，形成“言寡”与“意深”的对比。'
            },
            {
              role: '巧妙矛盾修辞 (Oxymoron)',
              content: 'communicative in a reserved way',
              explanation: '将“善于沟通 (communicative)”与“内敛含蓄 (reserved)”奇妙融合，生动刻画父子间无声胜有声的默契。'
            },
            {
              role: '宾语从句',
              content: 'that he meant a great deal more than that',
              explanation: '“a great deal more” 作代词短语，表示“远不止表面这些”。'
            }
          ]
        },
        {
          id: 'sent-4',
          rawText: 'In consequence, I’m inclined to reserve all judgements, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.',
          chineseTranslation: '因此，我倾向于不对任何人妄下判断，这种习惯让我接触到了许多性格古怪奇特的人，却也使我成了不少惯常招人厌烦之辈倾倒苦水的受害者。',
          difficultyTag: '长难句',
          coreKeywords: ['consequence', 'inclined', 'judgements', 'curious', 'victim', 'veteran', 'bores'],
          grammarComponents: [
            {
              role: '承接副词',
              content: 'In consequence',
              explanation: '起承上启下作用，意同 As a result，展示生活信条的成因。'
            },
            {
              role: '主干主句',
              content: 'I’m inclined to reserve all judgements',
              explanation: '“be inclined to” 表倾向；“reserve all judgements” 暂不下定论、包容倾听。'
            },
            {
              role: '同位语 (Appositive)',
              content: 'a habit',
              explanation: '独立名词同位语，承接并概括前句“保留评判”的整套行为。'
            },
            {
              role: '双重定语从句 + 双重否定',
              content: 'that has opened up ... and also made me the victim of not a few veteran bores',
              explanation: 'that 修饰 habit；“not a few” 构成双重否定表肯定（相当多）；“veteran bores” 精辟讽刺了社交圈那些滔滔不绝的老油条。'
            }
          ],
          culturalNote: '【幽默自嘲】菲茨杰拉德在此展现了精彩的英式自嘲幽默：过度善解人意和守口如瓶，反倒让自己经常沦为社交无聊客（bores）的垃圾桶。'
        },
        {
          id: 'sent-5',
          rawText: 'The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men.',
          chineseTranslation: '畸形怪诞的心智一旦在正常人身上察觉到这种品质，便会迫不及待地依附过来；也正因如此，大学时我曾被无端指责为圆滑世故的政客，仅仅因为那些狂放不羁、深藏不露的人总爱对我倾诉他们隐秘的悲伤。',
          difficultyTag: '长难句',
          coreKeywords: ['abnormal', 'attach', 'unjustly', 'politician', 'privy', 'griefs'],
          grammarComponents: [
            {
              role: '主句 + 不定式补足语',
              content: 'The abnormal mind is quick to detect and attach itself to this quality',
              explanation: '“be quick to do” 敏于行动；“attach itself to” 依附附着。'
            },
            {
              role: '结果引出句',
              content: 'and so it came about that...',
              explanation: '固定书面句型“it came about that”（导致/发生了...），that 引导主语从句。'
            },
            {
              role: '被动与介词短语',
              content: 'I was unjustly accused of being a politician',
              explanation: '“accuse sb of doing” 的被动语态；politician 在此非政治家，而是讽刺其表面待人圆滑、左右逢源。'
            },
            {
              role: '深度原因状语从句',
              content: 'because I was privy to the secret griefs of wild, unknown men',
              explanation: '“be privy to” 是文学高级短语，指知悉私密隐情。'
            }
          ]
        }
      ]
    }
  ]
};

export const INITIAL_VOCAB_ITEMS: VocabularyItem[] = [
  {
    id: 'vocab-1',
    word: 'vulnerable',
    phonetic: '/ˈvʌlnərəbl/',
    pos: 'adj.',
    translation: '脆弱的；易受伤害的；（阅历）浅薄稚嫩的',
    contextSentence: 'In my younger and more vulnerable years my father gave me some advice...',
    bookTitle: 'The Great Gatsby',
    chapterTitle: 'Chapter I',
    addedAt: '2026-10-10',
    level: 'CET6',
    status: 'learning'
  },
  {
    id: 'vocab-2',
    word: 'privy',
    phonetic: '/ˈprɪvi/',
    pos: 'adj.',
    translation: '私下知情的；准许获知秘密的',
    contextSentence: '...because I was privy to the secret griefs of wild, unknown men.',
    bookTitle: 'The Great Gatsby',
    chapterTitle: 'Chapter I',
    addedAt: '2026-10-10',
    level: 'GRE',
    status: 'new'
  }
];
