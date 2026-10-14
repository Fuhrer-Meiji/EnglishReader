import { Book, VocabularyItem, DifficultyLevel, BookCardInfo } from './types';

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
  },
  confidences: {
    word: 'confidence',
    phonetic: '/ˈkɒnfɪdəns/',
    pos: 'n.',
    translation: '知心话；私密倾诉；信任',
    englishDef: 'A secret or private matter told to someone under a condition of trust.',
    level: 'CET4'
  },
  unsought: {
    word: 'unsought',
    phonetic: '/ʌnˈsɔːt/',
    pos: 'adj.',
    translation: '未被主动探求的；不请自来的',
    englishDef: 'Not searched for or asked for.',
    level: 'GRE'
  },
  feigned: {
    word: 'feign',
    phonetic: '/feɪnd/',
    pos: 'v.',
    translation: '假装；装作；捏造',
    englishDef: 'Pretend to be affected by (a feeling, state, or injury).',
    level: 'GRE'
  },
  preoccupation: {
    word: 'preoccupation',
    phonetic: '/priːˌɒkjuˈpeɪʃn/',
    pos: 'n.',
    translation: '全神贯注；出神；心事重重',
    englishDef: 'The state or condition of being preoccupied or engrossed.',
    level: 'CET6'
  },
  hostile: {
    word: 'hostile',
    phonetic: '/ˈhɒstaɪl/',
    pos: 'adj.',
    translation: '敌对的；不友善的；抵触的',
    englishDef: 'Unfriendly; antagonistic.',
    level: 'CET4'
  },
  levity: {
    word: 'levity',
    phonetic: '/ˈlevəti/',
    pos: 'n.',
    translation: '轻率；轻浮；不严肃',
    englishDef: 'Humor or frivolity, especially the treatment of a serious matter with lack of respect.',
    level: 'GRE'
  },
  unmistakable: {
    word: 'unmistakable',
    phonetic: '/ˌʌnmɪˈsteɪkəbl/',
    pos: 'adj.',
    translation: '显而易见的；不会弄错的',
    englishDef: 'Not able to be mistaken for anything else; very distinctive.',
    level: 'CET6'
  },
  intimate: {
    word: 'intimate',
    phonetic: '/ˈɪntɪmət/',
    pos: 'adj.',
    translation: '私密的；亲密的；深层的',
    englishDef: 'Closely acquainted; familiar, close.',
    level: 'CET4'
  },
  revelation: {
    word: 'revelation',
    phonetic: '/ˌrevəˈleɪʃn/',
    pos: 'n.',
    translation: '袒露；披露；真情吐露',
    englishDef: 'A surprising and previously unknown fact, especially one that is made known in a dramatic way.',
    level: 'CET6'
  },
  quivering: {
    word: 'quiver',
    phonetic: '/ˈkwɪvərɪŋ/',
    pos: 'adj.',
    translation: '颤抖的；若隐若现的',
    englishDef: 'Trembling or shaking with a slight rapid motion.',
    level: 'GRE'
  },
  infinite: {
    word: 'infinite',
    phonetic: '/ˈɪnfɪnət/',
    pos: 'adj.',
    translation: '无限的；无穷无尽的',
    englishDef: 'Limitless or endless in space, extent, or size.',
    level: 'CET4'
  },
  snobbishly: {
    word: 'snobbishly',
    phonetic: '/ˈsnɒbɪʃli/',
    pos: 'adv.',
    translation: '势利地；自命不凡地',
    englishDef: 'In a manner that shows a snobbish attitude.',
    level: 'GRE'
  },
  fundamental: {
    word: 'fundamental',
    phonetic: '/ˌfʌndəˈmentl/',
    pos: 'adj.',
    translation: '根本的；基础的；原始的',
    englishDef: 'Forming a necessary base or core; of central importance.',
    level: 'CET4'
  },
  decencies: {
    word: 'decency',
    phonetic: '/ˈdiːsnsi/',
    pos: 'n.',
    translation: '体面；礼貌；规矩品行',
    englishDef: 'Behavior that conforms to accepted standards of morality or respectability.',
    level: 'CET6'
  },
  parcelled: {
    word: 'parcel',
    phonetic: '/ˈpɑːsld/',
    pos: 'v.',
    translation: '分配；打包；细分',
    englishDef: 'Divide into portions and distribute.',
    level: 'GRE'
  },
  unequally: {
    word: 'unequally',
    phonetic: '/ʌnˈiːkwəli/',
    pos: 'adv.',
    translation: '不平等地；不均匀地',
    englishDef: 'In an unequal or disparate manner.',
    level: 'CET4'
  },
  boasting: {
    word: 'boast',
    phonetic: '/bəʊstɪŋ/',
    pos: 'v.',
    translation: '自夸；吹嘘；夸耀',
    englishDef: 'Talk with excessive pride and self-satisfaction about one\'s achievements, possessions, or abilities.',
    level: 'CET4'
  },
  tolerance: {
    word: 'tolerance',
    phonetic: '/ˈtɒlərəns/',
    pos: 'n.',
    translation: '宽容；忍耐力；包容度',
    englishDef: 'The ability or willingness to tolerate something, in particular the existence of opinions or behavior that one does not necessarily agree with.',
    level: 'CET4'
  },
  admission: {
    word: 'admission',
    phonetic: '/ədˈmɪʃn/',
    pos: 'n.',
    translation: '承认；供认；准许加入',
    englishDef: 'A statement acknowledging the truth of something.',
    level: 'CET4'
  },
  conduct: {
    word: 'conduct',
    phonetic: '/ˈkɒndʌkt/',
    pos: 'n.',
    translation: '品行；操守；举止',
    englishDef: 'The manner in which a person behaves, especially on a particular occasion or in a particular context.',
    level: 'CET4'
  },
  founded: {
    word: 'found',
    phonetic: '/ˈfaʊndɪd/',
    pos: 'v.',
    translation: '建立在...之上；奠基',
    englishDef: 'Establish or originate an institution or system; base on.',
    level: 'CET4'
  },
  marshes: {
    word: 'marsh',
    phonetic: '/mɑːʃɪz/',
    pos: 'n.',
    translation: '沼泽；湿地',
    englishDef: 'An area of low-lying land which is flooded in wet seasons or at high tide, and typically remains waterlogged at all times.',
    level: 'CET6'
  },
  uniform: {
    word: 'uniform',
    phonetic: '/ˈjuːnɪfɔːm/',
    pos: 'n. / adj.',
    translation: '制服；整齐划一的',
    englishDef: 'Remaining the same in all cases and at all times; unchanging in form or character.',
    level: 'CET4'
  },
  moral: {
    word: 'moral',
    phonetic: '/ˈmɒrəl/',
    pos: 'adj.',
    translation: '道德上的；精神上的',
    englishDef: 'Concerned with the principles of right and wrong behavior.',
    level: 'CET4'
  },
  riotous: {
    word: 'riotous',
    phonetic: '/ˈraɪətəs/',
    pos: 'adj.',
    translation: '狂乱放纵的；暴乱的；喧闹的',
    englishDef: 'Characterized by wild and uncontrolled behavior.',
    level: 'GRE'
  },
  excursions: {
    word: 'excursion',
    phonetic: '/ɪkˈskɜːʃnz/',
    pos: 'n.',
    translation: '游历；涉足；远足',
    englishDef: 'A short journey or trip; a deviation from a regular activity.',
    level: 'CET6'
  },
  privileged: {
    word: 'privileged',
    phonetic: '/ˈprɪvəlɪdʒd/',
    pos: 'adj.',
    translation: '享有特权的；荣幸的',
    englishDef: 'Having special rights, advantages, or immunities.',
    level: 'CET4'
  },
  glimpses: {
    word: 'glimpse',
    phonetic: '/ɡlɪmpsɪz/',
    pos: 'n.',
    translation: '一瞥；短暂感受；隐约显露',
    englishDef: 'A momentary or partial view.',
    level: 'CET4'
  },
  exempt: {
    word: 'exempt',
    phonetic: '/ɪɡˈzempt/',
    pos: 'adj.',
    translation: '被免除的；豁免的',
    englishDef: 'Free from an obligation or liability imposed on others.',
    level: 'CET6'
  },
  reaction: {
    word: 'reaction',
    phonetic: '/riˈækʃn/',
    pos: 'n.',
    translation: '反应；回应；反抗',
    englishDef: 'An action performed or a feeling experienced in response to a situation or event.',
    level: 'CET4'
  },
  represented: {
    word: 'represent',
    phonetic: '/ˌreprɪˈzentɪd/',
    pos: 'v.',
    translation: '代表；象征；集中体现',
    englishDef: 'Be an embodiment or typical example of.',
    level: 'CET4'
  },
  unaffected: {
    word: 'unaffected',
    phonetic: '/ˌʌnəˈfektɪd/',
    pos: 'adj.',
    translation: '无矫饰的；真挚的；不造作的',
    englishDef: 'Feeling or showing no effect or change; sincere and genuine.',
    level: 'GRE'
  },
  scorn: {
    word: 'scorn',
    phonetic: '/skɔːn/',
    pos: 'n.',
    translation: '轻蔑；鄙视；不屑一顾',
    englishDef: 'The feeling or belief that someone or something is worthless or despicable.',
    level: 'CET6'
  },
  gorgeous: {
    word: 'gorgeous',
    phonetic: '/ˈɡɔːdʒəs/',
    pos: 'adj.',
    translation: '华美璀璨的；光彩夺目的；极好的',
    englishDef: 'Beautiful; very attractive; magnificent.',
    level: 'CET4'
  },
  heightened: {
    word: 'heightened',
    phonetic: '/ˈhaɪtnd/',
    pos: 'adj.',
    translation: '加剧的；提升的；高度敏锐的',
    englishDef: 'More intense than normal.',
    level: 'CET6'
  },
  sensitivity: {
    word: 'sensitivity',
    phonetic: '/ˌsensəˈtɪvəti/',
    pos: 'n.',
    translation: '敏感性；感应力；灵敏度',
    englishDef: 'The quality or condition of being sensitive.',
    level: 'CET4'
  },
  intricate: {
    word: 'intricate',
    phonetic: '/ˈɪntrɪkət/',
    pos: 'adj.',
    translation: '错综复杂的；精细微妙的',
    englishDef: 'Very complicated or detailed.',
    level: 'CET6'
  },
  register: {
    word: 'register',
    phonetic: '/ˈredʒɪstə(r)/',
    pos: 'v.',
    translation: '记录；察觉；感应到',
    englishDef: 'Express, record, or perceive subtly.',
    level: 'CET4'
  }
};

export const SAMPLE_BOOK: Book = {
  id: 'the-great-gatsby',
  title: 'The Great Gatsby',
  chineseTitle: '了不起的盖茨比',
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
          paragraphIndex: 0,
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
          paragraphIndex: 1,
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
          paragraphIndex: 2,
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
          paragraphIndex: 2,
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
          paragraphIndex: 2,
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
        },
        {
          id: 'sent-6',
          paragraphIndex: 3,
          rawText: 'Most of the confidences were unsought—frequently I have feigned sleep, preoccupation, or a hostile levity when I realized by some unmistakable sign that an intimate revelation was quivering on the horizon.',
          chineseTranslation: '绝大多数的私密倾诉都是我不曾主动求取的——每当我凭借某些确凿无误的迹象，察觉到某种内心的袒露正在地平线上隐隐颤动时，我常常假装睡着、装作心不在焉，或是流露出带有排斥感的轻佻冷淡。',
          difficultyTag: '长难句',
          coreKeywords: ['confidences', 'unsought', 'feigned', 'preoccupation', 'hostile', 'levity', 'unmistakable', 'intimate', 'revelation', 'quivering'],
          grammarComponents: [
            {
              role: '破折号前主句',
              content: 'Most of the confidences were unsought',
              explanation: '“unsought” 是 seek 的过去分词构成形容词，意为未经探求的、不期而遇的。'
            },
            {
              role: '并列宾语成分',
              content: 'feigned sleep, preoccupation, or a hostile levity',
              explanation: 'feign 后接三个平行并列的名词短语，刻画叙述者在面对他人倾诉时的防御姿态。'
            },
            {
              role: '多层状语与同位从句',
              content: 'when I realized by some unmistakable sign that an intimate revelation was quivering on the horizon',
              explanation: 'when 引导时间状语；by 引导介词方式状语；that 引导 realized 的宾语从句；“quivering on the horizon” 隐喻情感如曙光初现般呼之欲出。'
            }
          ],
          culturalNote: '【叙述者心理防御】菲茨杰拉德运用富有诗意的隐喻，揭示尼克面对他人情绪倾倒时的疲惫与疏离感。'
        },
        {
          id: 'sent-7',
          paragraphIndex: 4,
          rawText: 'Reserving judgements is a matter of infinite hope.',
          chineseTranslation: '保留一切评判，是对人性抱有无限希望的体现。',
          difficultyTag: '基础',
          coreKeywords: ['infinite', 'judgements'],
          grammarComponents: [
            {
              role: '动名词作主语',
              content: 'Reserving judgements',
              explanation: '动名词短语在句首担任全句主语。'
            },
            {
              role: '系表主干',
              content: 'is a matter of infinite hope',
              explanation: '主干为 SVC 系表结构，简洁有力，成为文学史上的金句。'
            }
          ],
          culturalNote: '【全书核心哲理】这一句被视作《了不起的盖茨比》最富深意的格言之一，既表达了对世人的宽容，也为盖茨比那种执着到近乎狂热的“了不起的希望”埋下了伏笔。'
        },
        {
          id: 'sent-8',
          paragraphIndex: 4,
          rawText: 'I am still a little afraid of missing something if I forget that, as my father snobbishly suggested, and I snobbishly repeat, a sense of the fundamental decencies is parcelled out unequally at birth.',
          chineseTranslation: '如果我忘记了父亲曾势利地暗示、而我也势利地重申过的一句话——在这个世界上，基本的体面与道德感在人出生时分配得并不均等——我依然会隐隐害怕自己错过了什么。',
          difficultyTag: '长难句',
          coreKeywords: ['snobbishly', 'fundamental', 'decencies', 'parcelled', 'unequally'],
          grammarComponents: [
            {
              role: '主句 + 宾语形容词短语',
              content: 'I am still a little afraid of missing something',
              explanation: '“be afraid of doing” 表顾虑恐惧；“a little” 修饰 degree。'
            },
            {
              role: '条件从句 + 双重插入语',
              content: 'if I forget that, as my father snobbishly suggested, and I snobbishly repeat...',
              explanation: 'if 引导条件状语，that 引导 forget 的宾语从句；两个 as 并列从句作叙述插入语，表达自嘲反思。'
            },
            {
              role: '宾语从句核心被动句',
              content: 'a sense of the fundamental decencies is parcelled out unequally at birth',
              explanation: '主语为 a sense of fundamental decencies；is parcelled out 为被动语态，unequally 副词修饰。'
            }
          ],
          culturalNote: '【宿命与特权观】尼克清醒地认识到自己所谓的“教养与道德水准”并非与生俱来的优越，而是富裕中产家庭环境赋予的隐形特权。'
        },
        {
          id: 'sent-9',
          paragraphIndex: 5,
          rawText: 'And, after boasting this way of my tolerance, I come to the admission that it has a limit.',
          chineseTranslation: '在吹嘘完我这种宽容与忍耐之后，我不得不承认，这种宽容也是有底线的。',
          difficultyTag: '基础',
          coreKeywords: ['boasting', 'tolerance', 'admission'],
          grammarComponents: [
            {
              role: '时间介词短语状语',
              content: 'after boasting this way of my tolerance',
              explanation: 'after 介词接动名词短语，构成时间状语。'
            },
            {
              role: '主干 + 同位语从句',
              content: 'I come to the admission that it has a limit',
              explanation: 'come to the admission（做出招认）；that 引导同位语从句解释 admission 具体内容。'
            }
          ]
        },
        {
          id: 'sent-10',
          paragraphIndex: 5,
          rawText: 'Conduct may be founded on the hard rock or the wet marshes, but after a certain point I don’t care what it’s founded on.',
          chineseTranslation: '一个人的品行操守，或许奠基于坚如磐石的准则，亦或立足于湿软泥泞的沼泽，但过了某个特定的界限，我便不再在乎它是基于何种根基。',
          difficultyTag: '长难句',
          coreKeywords: ['conduct', 'founded', 'marshes'],
          grammarComponents: [
            {
              role: '转折对比并列句',
              content: 'Conduct may be founded on ... but ... I don\'t care...',
              explanation: 'but 连接转折分句；“hard rock” 与 “wet marshes” 构成生动的二元对立隐喻。'
            },
            {
              role: '宾语从句',
              content: 'what it’s founded on',
              explanation: 'what 引导宾语从句，作 care 的宾语。'
            }
          ]
        },
        {
          id: 'sent-11',
          paragraphIndex: 5,
          rawText: 'When I came back from the East last autumn I felt that I wanted the world to be in uniform and at a sort of moral attention for ever; I wanted no more riotous excursions with privileged glimpses into the human heart.',
          chineseTranslation: '去年秋天我从东部回到故乡时，我渴望整个世界都穿上整齐划一的制服，在道德面前永远保持肃穆立正；我再也不想去经历那些狂乱放纵的游历，也不愿再去窥探他人内心深处的私密特权。',
          difficultyTag: '长难句',
          coreKeywords: ['uniform', 'moral', 'riotous', 'excursions', 'privileged', 'glimpses'],
          grammarComponents: [
            {
              role: '复合从句 + 军事隐喻',
              content: 'wanted the world to be in uniform and at a sort of moral attention for ever',
              explanation: '“in uniform” 和 “at attention”（立正姿势）运用了精准的军队纪律隐喻，反映一战后老兵尼克对浮华世界的幻灭。'
            },
            {
              role: '分号并列句',
              content: 'I wanted no more riotous excursions with privileged glimpses into the human heart',
              explanation: '“riotous excursions” 指纽约长岛纸醉金迷的纵欲放荡；“privileged glimpses” 呼应前文倾听秘密的特权。'
            }
          ],
          culturalNote: '【幻灭与回归】尼克经历了东部繁华喧嚣后产生的深刻道德疲惫，促使他渴望秩序、规训与内心的安宁。'
        },
        {
          id: 'sent-12',
          paragraphIndex: 6,
          rawText: 'Only Gatsby, the man who gives his name to this book, was exempt from my reaction—Gatsby, who represented everything for which I have an unaffected scorn.',
          chineseTranslation: '唯有盖茨比——这个赋予本书名字的男人——在我的这种厌倦反应之外；盖茨比，他身上集中体现了我向来怀着毫无矫饰的鄙夷所看待的一切。',
          difficultyTag: '长难句',
          coreKeywords: ['exempt', 'reaction', 'represented', 'unaffected', 'scorn'],
          grammarComponents: [
            {
              role: '同位语 + 定语从句',
              content: 'Only Gatsby, the man who gives his name to this book...',
              explanation: 'Gatsby 后接先行词同位语及 who 限制性定语从句。'
            },
            {
              role: '破折号强调同位语 + 介词前置定语从句',
              content: 'Gatsby, who represented everything for which I have an unaffected scorn',
              explanation: '“for which” 引导定语从句修饰 everything；“unaffected scorn” 展现了尼克克制言语下强烈的审美品味。'
            }
          ]
        },
        {
          id: 'sent-13',
          paragraphIndex: 6,
          rawText: 'If personality is an unbroken series of successful gestures, then there was something gorgeous about him, some heightened sensitivity to the promises of life, as if he were related to one of those intricate machines that register earthquakes ten thousand miles away.',
          chineseTranslation: '如果一个人的个性是由一连串成功的姿态所构成，那么他身上确有一种华美璀璨的特质，他对生活的诸般承诺具有一种极度敏锐的感应，仿佛他与某种能在万里之外记录地震的精密仪器心意相通。',
          difficultyTag: '长难句',
          coreKeywords: ['personality', 'unbroken', 'gestures', 'gorgeous', 'heightened', 'sensitivity', 'intricate', 'register'],
          grammarComponents: [
            {
              role: '虚拟假设条件从句',
              content: 'If personality is an unbroken series of successful gestures',
              explanation: '菲茨杰拉德标志性的唯美思辨长句。'
            },
            {
              role: '主干从句 + 并列同位语',
              content: 'there was something gorgeous about him, some heightened sensitivity to the promises of life',
              explanation: 'there be 句型，gorgeous 修饰 something；sensitivity 进一步深化 gorgeous 的内涵。'
            },
            {
              role: 'as if 虚拟语气地震仪隐喻',
              content: 'as if he were related to one of those intricate machines that register earthquakes ten thousand miles away',
              explanation: '文学史顶级隐喻：将盖茨比的情感感应力比拟为记录万里外地震的精密仪器（seismograph）。'
            }
          ],
          culturalNote: '【浪漫主义核心特质】这是整部作品对盖茨比最核心、最光彩夺目的定性——他对生活与爱情具有超凡脱俗的敏感与狂热信念。'
        }
      ]
    }
  ]
};

export const INITIAL_VOCAB_ITEMS: VocabularyItem[] = [];

export const BOOKS_DATABASE: Record<string, Book> = {
  'the-great-gatsby': SAMPLE_BOOK,
};

export const LIBRARY_BOOKS: BookCardInfo[] = [
  {
    id: 'the-picture-of-dorian-gray',
    title: 'The Picture of Dorian Gray',
    chineseTitle: '道林·格雷的画像',
    author: 'Oscar Wilde',
    publishedYear: 1890,
    cefr: 'C1',
    lexile: '980L',
    wordCount: 79423,
    coverBg: 'from-purple-700 via-purple-900 to-stone-950',
    description: '唯美主义大师王尔德唯一的长篇小说，辞藻华丽典雅，充满警句格言与人性思辨。',
    category: '唯美主义',
    recommendedAudience: 'GRE / 雅思 / 高级精读',
    readingProgress: 0,
    totalChapters: 21,
  },
  {
    id: 'the-great-gatsby',
    title: 'The Great Gatsby',
    chineseTitle: '了不起的盖茨比',
    author: 'F. Scott Fitzgerald',
    publishedYear: 1925,
    cefr: 'C1',
    lexile: '1020L',
    wordCount: 48551,
    coverBg: 'from-amber-600 via-amber-800 to-stone-900',
    description: '20世纪20年代爵士时代经典之作，以迷幻而清醒的笔触刻画了美国梦的幻灭。',
    category: '现代文学',
    recommendedAudience: '考研 / GRE / 托福',
    readingProgress: 0,
    totalChapters: 9,
  },
  {
    id: 'pride-and-prejudice',
    title: 'Pride and Prejudice',
    chineseTitle: '傲慢与偏见',
    author: 'Jane Austen',
    publishedYear: 1813,
    cefr: 'B2',
    lexile: '1090L',
    wordCount: 122087,
    coverBg: 'from-rose-700 via-amber-900 to-stone-950',
    description: '19世纪英国文学巨著，机智风趣的对话与细腻的世态人情，英语学习者的必读经典。',
    category: '英国文学',
    recommendedAudience: '六级 / 考研 / 雅思',
    readingProgress: 0,
    totalChapters: 61,
  },
  {
    id: 'alices-adventures-in-wonderland',
    title: "Alice's Adventures in Wonderland",
    chineseTitle: '爱丽丝梦游仙境',
    author: 'Lewis Carroll',
    publishedYear: 1865,
    cefr: 'B1',
    lexile: '890L',
    wordCount: 27500,
    coverBg: 'from-emerald-600 via-teal-800 to-stone-900',
    description: '奇幻文学鼻祖，富含谐音双关与双重修辞，适合在妙趣横生的故事中提升语感。',
    category: '奇幻童话',
    recommendedAudience: '四六级 / 趣味进阶',
    readingProgress: 0,
    totalChapters: 14,
  },
  {
    id: 'winnie-the-pooh',
    title: 'Winnie-the-Pooh',
    chineseTitle: '小熊维尼',
    author: 'A. A. Milne',
    publishedYear: 1926,
    cefr: 'B1',
    lexile: '720L',
    wordCount: 22796,
    coverBg: 'from-amber-500 via-amber-700 to-stone-900',
    description: '百亩森林里纯真美好的童年童话，语言纯正地道、生动易读，适合各水平入门精读。',
    category: '温情童话',
    recommendedAudience: '四级 / 高考 / 初学者精读',
    readingProgress: 0,
    totalChapters: 11,
  },
  {
    id: 'the-adventures-of-sherlock-holmes',
    title: 'The Adventures of Sherlock Holmes',
    chineseTitle: '福尔摩斯探案集',
    author: 'Arthur Conan Doyle',
    publishedYear: 1892,
    cefr: 'B2',
    lexile: '1040L',
    wordCount: 104892,
    coverBg: 'from-slate-800 via-stone-900 to-black',
    description: '世界推理小说丰碑，贝克街221B的传奇探案，逻辑严密、叙事流畅引人入胜。',
    category: '侦探推理',
    recommendedAudience: '四六级 / 逻辑进阶',
    readingProgress: 0,
    totalChapters: 12,
  },
  {
    id: 'a-tale-of-two-cities',
    title: 'A Tale of Two Cities',
    chineseTitle: '双城记',
    author: 'Charles Dickens',
    publishedYear: 1859,
    cefr: 'C1',
    lexile: '1140L',
    wordCount: 137000,
    coverBg: 'from-yellow-950 via-stone-900 to-black',
    description: '“那是最好的时代，那是最坏的时代。” 狄更斯笔下法国大革命波澜壮阔的历史画卷。',
    category: '历史名著',
    recommendedAudience: '考研 / 雅思 / 文学精读',
    readingProgress: 0,
    totalChapters: 46,
  },
];


