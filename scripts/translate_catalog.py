import json
import time
import urllib.request
import urllib.parse
import re
import os

CATALOG_PATH = os.path.join(os.path.dirname(__file__), "../apps/web/data/full_public_catalog.json")

# Curated dictionary for world-famous literary classics
FAMOUS_TRANSLATIONS = {
    # Shakespeare
    "Hamlet": "哈姆雷特",
    "Macbeth": "麦克白",
    "Othello": "奥赛罗",
    "King Lear": "李尔王",
    "Romeo and Juliet": "罗密欧与朱丽叶",
    "A Midsummer Night’s Dream": "仲夏夜之梦",
    "A Midsummer Night's Dream": "仲夏夜之梦",
    "The Merchant of Venice": "威尼斯商人",
    "Twelfth Night": "第十二夜",
    "The Tempest": "暴风雨",
    "As You Like It": "皆大欢喜",
    "Much Ado About Nothing": "无事生非",
    "Julius Caesar": "裘力斯·凯撒",
    "Antony and Cleopatra": "安东尼与克莉奥佩特拉",
    "The Comedy of Errors": "错中错",
    "The Taming of the Shrew": "驯悍记",
    "The Winter’s Tale": "冬天的故事",
    "The Winter's Tale": "冬天的故事",
    "The Sonnets": "十四行诗",
    "Sonnets": "十四行诗",
    "Coriolanus": "科利奥兰纳斯",
    "Richard III": "理查三世",
    "Henry V": "亨利五世",
    "Measure for Measure": "一报还一报",
    "All’s Well That Ends Well": "终成眷属",
    "All's Well That Ends Well": "终成眷属",
    "Love’s Labour’s Lost": "爱的徒劳",
    "Love's Labour's Lost": "爱的徒劳",
    "Troilus and Cressida": "特洛伊罗斯与克瑞西达",
    "Cymbeline": "辛白林",
    "Pericles, Prince of Tyre": "泰尔亲王佩里克利斯",
    "Titus Andronicus": "泰特斯·安特洛尼克斯",
    "Timon of Athens": "雅典的泰蒙",

    # Charles Dickens
    "A Tale of Two Cities": "双城记",
    "Great Expectations": "远大前程",
    "Oliver Twist": "雾都孤儿",
    "David Copperfield": "大卫·科波菲尔",
    "A Christmas Carol": "小气财神（圣诞颂歌）",
    "Bleak House": "荒凉山庄",
    "Hard Times": "艰难时世",
    "Little Dorrit": "小杜丽",
    "The Pickwick Papers": "匹克威克外传",
    "The Posthumous Papers of the Pickwick Club": "匹克威克外传",
    "Our Mutual Friend": "我们共同的朋友",
    "The Mystery of Edwin Drood": "艾德温·德鲁德之谜",
    "Dombey and Son": "董贝父子",
    "Nicholas Nickleby": "尼古拉斯·尼克贝",
    "The Old Curiosity Shop": "老古玩店",
    "Barnaby Rudge": "巴纳比·拉奇",
    "The Chimes": "新年钟声",
    "The Cricket on the Hearth": "炉边蟋蟀",

    # Jane Austen
    "Pride and Prejudice": "傲慢与偏见",
    "Sense and Sensibility": "理智与情感",
    "Emma": "爱玛",
    "Mansfield Park": "曼斯菲尔德庄园",
    "Northanger Abbey": "诺桑觉寺",
    "Persuasion": "劝导",
    "Lady Susan": "苏珊夫人",

    # Arthur Conan Doyle (Sherlock Holmes)
    "A Study in Scarlet": "血字的研究",
    "The Sign of the Four": "四签名",
    "The Adventures of Sherlock Holmes": "福尔摩斯冒险史",
    "The Memoirs of Sherlock Holmes": "福尔摩斯回忆录",
    "The Return of Sherlock Holmes": "福尔摩斯归来记",
    "The Hound of the Baskervilles": "巴斯克维尔的猎犬",
    "The Valley of Fear": "恐怖谷",
    "His Last Bow": "最后致意",
    "The Case-Book of Sherlock Holmes": "福尔摩斯案件簿",
    "The Lost World": "失落的世界",
    "The Poison Belt": "有毒地带",
    "The White Company": "白色纵队",

    # Agatha Christie
    "The Mysterious Affair at Styles": "斯泰尔斯庄园奇案",
    "The Secret Adversary": "暗藏杀机",
    "The Murder on the Links": "高尔夫球场命案",
    "The Man in the Brown Suit": "褐衣男子",
    "The Secret of Chimneys": "烟囱大厦的秘密",
    "The Murder of Roger Ackroyd": "罗杰疑案",
    "The Big Four": "四大魔头",
    "The Mystery of the Blue Train": "蓝色列车之谜",
    "The Seven Dials Mystery": "七面钟之谜",
    "The Murder at the Vicarage": "牧师公馆谋杀案",
    "Giant’s Bread": "巨人的面包",
    "Giant's Bread": "巨人的面包",
    "Partners in Crime": "犯罪团伙",
    "Poirot Investigates": "波洛出击",

    # H. G. Wells
    "The Time Machine": "时间机器",
    "The War of the Worlds": "世界之战",
    "The Invisible Man": "隐形人",
    "The Island of Doctor Moreau": "莫罗博士的岛",
    "The First Men in the Moon": "月球上第一批人",
    "When the Sleeper Wakes": "当沉睡者醒来",
    "The Food of the Gods and How It Came to Earth": "神仙的粮食",
    "A Modern Utopia": "现代乌托邦",
    "The Outline of History": "世界简史",
    "The Country of the Blind and Other Stories": "盲人国与其它故事",
    "Tono-Bungay": "托诺-邦盖",
    "The History of Mr. Polly": "波利先生的历史",

    # Jules Verne
    "Twenty Thousand Leagues Under the Sea": "海底两万里",
    "Around the World in Eighty Days": "八十天环游地球",
    "Journey to the Center of the Earth": "地心游记",
    "The Mysterious Island": "神秘岛",
    "From the Earth to the Moon": "从地球到月球",
    "Around the Moon": "环绕月球",
    "Five Weeks in a Balloon": "气球上的五星期",
    "Michael Strogoff": "沙皇的骑信使（米哈伊尔·斯特罗戈夫）",
    "In Search of the Castaways": "格兰特船长的儿女",
    "The Master of the World": "世界之主",
    "Robur the Conqueror": "征服者罗比尔",

    # Mark Twain
    "The Adventures of Tom Sawyer": "汤姆·索亚历险记",
    "Adventures of Huckleberry Finn": "哈克贝利·费恩历险记",
    "The Adventures of Huckleberry Finn": "哈克贝利·费恩历险记",
    "The Prince and the Pauper": "乞丐与王子",
    "A Connecticut Yankee in King Arthur’s Court": "康州美国佬在亚瑟王朝",
    "A Connecticut Yankee in King Arthur's Court": "康州美国佬在亚瑟王朝",
    "Life on the Mississippi": "密西西比河上的生活",
    "The Innocents Abroad": "傻子出国记",
    "Roughing It": "苦行记",
    "The Gilded Age": "镀金时代",
    "The Mysterious Stranger": "神秘陌生人",

    # Jack London
    "The Call of the Wild": "野性的呼唤",
    "White Fang": "白牙",
    "The Sea-Wolf": "海狼",
    "Martin Eden": "马丁·伊登",
    "The Iron Heel": "铁蹄",
    "Before Adam": "亚当之前",
    "The Star Rover": "星游者",
    "John Barleycorn": "约翰·巴利康",
    "South Sea Tales": "南海故事集",

    # Robert Louis Stevenson
    "Treasure Island": "金银岛",
    "Strange Case of Dr. Jekyll and Mr. Hyde": "化身博士",
    "The Strange Case of Dr. Jekyll and Mr. Hyde": "化身博士",
    "Kidnapped": "绑架",
    "Catriona": "卡特丽奥娜",
    "The Master of Ballantrae": "巴兰特雷少爷",
    "The Black Arrow": "黑箭",
    "New Arabian Nights": "新天方夜谭",
    "A Child’s Garden of Verses": "一个孩子的诗园",
    "A Child's Garden of Verses": "一个孩子的诗园",

    # Russian Classics (Tolstoy, Dostoevsky, Turgenev, Chekhov, Gogol)
    "War and Peace": "战争与和平",
    "Anna Karenina": "安娜·卡列尼娜",
    "Resurrection": "复活",
    "The Death of Ivan Ilyich": "伊凡·伊里奇之死",
    "The Kreutzer Sonata": "克罗采奏鸣曲",
    "Crime and Punishment": "罪与罚",
    "The Brothers Karamazov": "卡拉马佐夫兄弟",
    "The Idiot": "白痴",
    "Demons": "群魔",
    "Notes from Underground": "地下室手记",
    "The Gambler": "赌徒",
    "Poor Folk": "穷人",
    "Fathers and Sons": "父与子",
    "Dead Souls": "死魂灵",
    "Taras Bulba": "塔拉斯·布尔巴",
    "The Inspector General": "钦差大臣",

    # French Classics (Hugo, Dumas, Balzac, Flaubert, Zola, Leblanc)
    "Les Misérables": "悲惨世界",
    "The Hunchback of Notre-Dame": "巴黎圣母院",
    "Ninety-Three": "九三年",
    "The Count of Monte Cristo": "基督山伯爵",
    "The Three Musketeers": "三个火枪手",
    "Twenty Years After": "二十年后",
    "The Vicomte de Bragelonne": "布拉热洛纳子爵",
    "The Black Tulip": "黑郁金香",
    "Madame Bovary": "包法利夫人",
    "Père Goriot": "高老头",
    "Eugénie Grandet": "欧也妮·葛朗台",
    "The Extra-Ordinary Adventures of Arsène Lupin, Gentleman-Burglar": "绅士怪盗亚森·罗宾",
    "The Hollow Needle": "奇岩城",
    "813": "813之谜",
    "The Crystal Stopper": "水晶瓶塞",

    # Philosophy & Non-fiction
    "The Wealth of Nations": "国富论",
    "The Theory of Moral Sentiments": "道德情操论",
    "The Republic": "理想国",
    "Meditations": "沉思录",
    "Beyond Good and Evil": "善恶的彼岸",
    "Thus Spake Zarathustra": "查拉图斯特拉如是说",
    "The Prince": "君主论",
    "Walden": "瓦尔登湖",
    "Self-Reliance": "自立",
    "Common Sense": "常识",
    "The Art of War": "孙子兵法",
    "Tao Te Ching": "道德经",
    "The Communist Manifesto": "共产党宣言",
    "On Liberty": "论自由",
    "Utilitarianism": "功利主义",
    "A Vindication of the Rights of Woman": "为女权辩护",
    "The Social Contract": "社会契约论",
    "Candide": "老实人",
    "Fables": "伊索寓言",

    # British & American 19th/20th century classics
    "The Great Gatsby": "了不起的盖茨比",
    "Alice’s Adventures in Wonderland": "爱丽丝梦游仙境",
    "Alice's Adventures in Wonderland": "爱丽丝梦游仙境",
    "Through the Looking-Glass": "爱丽丝镜中奇遇记",
    "Through the Looking-Glass, and What Alice Found There": "爱丽丝镜中奇遇记",
    "The Picture of Dorian Gray": "道林·格雷的画像",
    "Frankenstein": "弗兰肯斯坦（科学怪人）",
    "Dracula": "德古拉（吸血伯爵）",
    "Moby-Dick": "白鲸",
    "Moby-Dick; or, The Whale": "白鲸",
    "The Scarlet Letter": "红字",
    "The House of the Seven Gables": "七角楼房",
    "Wuthering Heights": "呼啸山庄",
    "Jane Eyre": "简·爱",
    "The Professor": "教师",
    "Villette": "维莱特",
    "Agnes Grey": "阿格尼斯·格雷",
    "The Tenant of Wildfell Hall": "荒野庄园的房客",
    "Silas Marner": "织工马南",
    "Middlemarch": "米德尔马契",
    "The Mill on the Floss": "弗罗斯河上的磨坊",
    "Tess of the d’Urbervilles": "德伯家的苔丝",
    "Tess of the d'Urbervilles": "德伯家的苔丝",
    "Far from the Madding Crowd": "远离尘嚣",
    "The Mayor of Casterbridge": "卡斯特桥市长",
    "Jude the Obscure": "无名的裘德",
    "The Return of the Native": "还乡",
    "Heart of Darkness": "黑暗的心",
    "Lord Jim": "吉姆老爷",
    "Nostromo": "诺斯特罗莫",
    "The Secret Agent": "间谍",
    "Under Western Eyes": "在西方目光下",
    "Youth: A Narrative": "青年",
    "Typhoon": "台风",
    "The Shadow-Line": "阴影线",
    "Victory": "胜利",
    "Dubliners": "都柏林人",
    "A Portrait of the Artist as a Young Man": "青年艺术家的画像",
    "Ulysses": "尤利西斯",
    "Mrs. Dalloway": "达洛维夫人",
    "Mrs Dalloway": "达洛维夫人",
    "To the Lighthouse": "到灯塔去",
    "Orlando": "奥兰多",
    "The Waves": "海浪",
    "Sons and Lovers": "儿子与情人",
    "Women in Love": "恋爱中的女人",
    "The Rainbow": "虹",
    "Lady Chatterley’s Lover": "查泰莱夫人的情人",
    "Lady Chatterley's Lover": "查泰莱夫人的情人",
    "Of Human Bondage": "人性的枷锁",
    "The Moon and Sixpence": "月亮与六便士",
    "The Painted Veil": "面纱",
    "Cakes and Ale": "寻欢作乐",
    "The Thirty-Nine Steps": "三十九级台阶",
    "Greenmantle": "绿斗篷",
    "The Red House Mystery": "红屋之谜",
    "Winnie-the-Pooh": "小熊维尼",
    "The House at Pooh Corner": "小熊维尼的小屋",
    "When We Were Very Young": "当我们年轻时",
    "Now We Are Six": "六岁那年",
    "The Secret Garden": "秘密花园",
    "A Little Princess": "小公主",
    "Little Lord Fauntleroy": "小公子",
    "Peter and Wendy": "彼得·潘与温蒂",
    "Peter Pan": "彼得·潘",
    "The Wind in the Willows": "柳林风声",
    "The Wonderful Wizard of Oz": "绿野仙踪",
    "The Marvelous Land of Oz": "奥兹仙境",
    "Ozma of Oz": "奥兹玛公主",
    "Dorothy and the Wizard in Oz": "多萝西与奥兹国术士",
    "The Road to Oz": "通往奥兹之路",
    "The Emerald City of Oz": "奥兹翡翠城",
    "The Patchwork Girl of Oz": "碎布女孩",
    "Tarzan of the Apes": "人猿泰山",
    "The Return of Tarzan": "泰山归来",
    "The Beasts of Tarzan": "泰山与野兽",
    "The Son of Tarzan": "泰山之子",
    "Tarzan and the Jewels of Opar": "泰山与奥帕的宝藏",
    "A Princess of Mars": "火星公主",
    "The Gods of Mars": "火星神灵",
    "The Warlord of Mars": "火星大统领",
    "Thuvia, Maid of Mars": "火星少女苏薇亚",
    "The Chessmen of Mars": "火星棋局",
    "At the Earth’s Core": "地心世界",
    "At the Earth's Core": "地心世界",
    "Pellucidar": "佩卢西达",
    "The Land That Time Forgot": "时间遗忘之岛",
    "Leave It to Psmith": "交给普史密斯",
    "Right Ho, Jeeves": "没错，吉夫斯",
    "The Inimitable Jeeves": "绝顶聪明的吉夫斯",
    "Carry On, Jeeves": "继续，吉夫斯",
    "Very Good, Jeeves!": "很好，吉夫斯！",
    "My Man Jeeves": "我的男仆吉夫斯",
    "The Code of the Woosters": "伍斯特家族守则",
    "Psmith in the City": "普史密斯进城记",
    "Psmith, Journalist": "记者普史密斯",
    "Something Fresh": "新鲜事儿",
    "A Damsel in Distress": "落难少女",
    "The Little Prince": "小王子",
    "Night Flight": "夜航",
    "Wind, Sand and Stars": "风沙星辰",
    "The Innocence of Father Brown": "布朗神父的天真",
    "The Wisdom of Father Brown": "布朗神父的智慧",
    "The Incredulity of Father Brown": "布朗神父的怀疑",
    "The Secret of Father Brown": "布朗神父的秘密",
    "The Scandal of Father Brown": "布朗神父的丑闻",
    "The Man Who Was Thursday": "星期四的男子",
    "The Scarlet Pimpernel": "红花侠",
    "I Will Repay": "必有报应",
    "El Dorado": "黄金国",
    "The Elusive Pimpernel": "行踪难测的红花侠",
    "Lord Peter Views the Body": "彼得勋爵验尸记",
    "Whose Body?": "那是谁的尸体？",
    "Clouds of Witness": "证人云集",
    "Unnatural Death": "非自然死亡",
    "The Cask": "沉桶谜案",
    "The Groote Park Murder": "格鲁特公园谋杀案",
    "Inspector French’s Greatest Case": "法兰西督察的最大案件",
    "Inspector French's Greatest Case": "法兰西督察的最大案件",
    "The Four Just Men": "四正人",
    "The Council of Justice": "正义委员会",
    "The Clue of the Twisted Candle": "螺旋蜡烛的线索",
    "The Crimson Circle": "深红圆环",
    "The Green Archer": "绿衣弓箭手",
    "The Mind of Mr. J. G. Reeder": "雷德先生的心思",
    "The Middle Temple Murder": "中殿律师学院谋杀案",
    "The Moonstone": "月亮宝石",
    "The Woman in White": "白衣女人",
    "No Name": "无名氏",
    "Armadale": "阿玛代尔",
    "She": "她（所罗门宝藏前传）",
    "King Solomon’s Mines": "所罗门王的宝藏",
    "King Solomon's Mines": "所罗门王的宝藏",
    "Allan Quatermain": "艾伦·夸特梅因",
    "Nada the Lily": "百合娜达",
    "The Four Feathers": "四根羽毛",
    "The Moon Pool": "月亮池",
    "Russian Folktales": "俄罗斯民间故事",
    "In Darkest London": "在最黑暗的伦敦",
    "Pan Tadeusz": "潘塔德乌什",
    "Agamemnon": "阿伽门农",
    "The Eumenides": "复仇女神",
    "The Libation Bearers": "奠酒人",
    "Prometheus Bound": "被缚的普罗米修斯",
    "The Seven Against Thebes": "七将攻忒拜",
    "The Persians": "波斯人",
    "The Suppliant Maidens": "祈援少女",
    "Oedipus Rex": "俄狄浦斯王",
    "Oedipus the King": "俄狄浦斯王",
    "Antigone": "安提戈涅",
    "Electra": "厄勒克特拉",
    "Medea": "美狄亚",
    "The Trojan Women": "特洛伊妇女",
    "The Bacchae": "酒神的伴侣",
    "Alcestis": "阿尔刻提斯",
    "Hippolytus": "希波吕托斯",
    "Andromache": "安德洛玛刻",
    "The Birds": "鸟",
    "The Clouds": "云",
    "The Frogs": "青蛙",
    "Lysistrata": "利西翠妲",
    "The Iliad": "伊利亚特",
    "The Odyssey": "奥德赛",
    "The Aeneid": "埃涅阿斯纪",
    "Metamorphoses": "变形记",
    "The Divine Comedy": "神曲",
    "Inferno": "神曲·地狱篇",
    "Purgatorio": "神曲·炼狱篇",
    "Paradiso": "神曲·天堂篇",
    "Don Quixote": "堂吉诃德",
    "The Decameron": "十日谈",
    "Gargantua and Pantagruel": "巨人传",
    "Paradise Lost": "失乐园",
    "Paradise Regained": "复乐园",
    "Samson Agonistes": "力士参孙",
    "Faust": "浮士德",
    "The Sorrows of Young Werther": "少年维特之烦恼",
    "Wilhelm Meister’s Apprenticeship": "威廉·迈斯特的学习时代",
    "Wilhelm Meister's Apprenticeship": "威廉·迈斯特的学习时代",
    "The Robbers": "强盗",
    "Wilhelm Tell": "威廉·退尔",
    "Wallenstein": "华伦斯坦",
    "Peer Gynt": "培尔·金特",
    "A Doll’s House": "玩偶之家",
    "A Doll's House": "玩偶之家",
    "Ghosts": "群鬼",
    "An Enemy of the People": "人民公敌",
    "The Wild Duck": "野鸭",
    "Hedda Gabler": "海达·高布乐",
    "The Master Builder": "建筑大师",
    "The Cherry Orchard": "樱桃园",
    "The Seagull": "海鸥",
    "Uncle Vanya": "万尼亚舅舅",
    "Three Sisters": "三姐妹",
}

def clean_title_str(t: str) -> str:
    # Remove leading/trailing quotation marks or brackets
    t = t.strip()
    t = re.sub(r'^[《“"\'「（\(]+|[》”"\'」）\)]+$', '', t)
    return t.strip()

def translate_batch(batch):
    # Returns list of translated strings
    text = "\n".join(batch)
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q={urllib.parse.quote(text)}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        translated_text = "".join([part[0] for part in data[0] if part[0]])
        lines = translated_text.split("\n")
        # Ensure equal count
        cleaned = [clean_title_str(l) for l in lines]
        return cleaned

def main():
    print(f"Loading catalog from {CATALOG_PATH}...")
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    print(f"Total books: {len(catalog)}")

    # 1. First apply FAMOUS_TRANSLATIONS
    matched_famous = 0
    needs_api = []

    for idx, book in enumerate(catalog):
        title = book.get("title", "").strip()
        existing_cn = book.get("chineseTitle", "").strip()

        # Check curated
        if title in FAMOUS_TRANSLATIONS:
            book["chineseTitle"] = FAMOUS_TRANSLATIONS[title]
            matched_famous += 1
        elif clean_title_str(title) in FAMOUS_TRANSLATIONS:
            book["chineseTitle"] = FAMOUS_TRANSLATIONS[clean_title_str(title)]
            matched_famous += 1
        elif existing_cn:
            # Keep existing
            pass
        else:
            needs_api.append((idx, title))

    print(f"Matched from curated dictionary: {matched_famous}")
    print(f"Still needs translation via API: {len(needs_api)}")

    # 2. Batch translate via API in chunks of 25
    batch_size = 25
    for i in range(0, len(needs_api), batch_size):
        chunk = needs_api[i:i + batch_size]
        titles_chunk = [item[1] for item in chunk]
        print(f"Translating chunk {i // batch_size + 1}/{(len(needs_api) + batch_size - 1) // batch_size} ({len(chunk)} titles)...")

        retries = 3
        results = None
        while retries > 0:
            try:
                results = translate_batch(titles_chunk)
                if len(results) == len(titles_chunk):
                    break
                else:
                    # Line count mismatch, do individual fallback for this chunk
                    print(f"Line mismatch (got {len(results)}, expected {len(titles_chunk)}), falling back to individual calls...")
                    results = []
                    for t in titles_chunk:
                        ind_res = translate_batch([t])
                        results.append(ind_res[0] if ind_res else t)
                        time.sleep(0.1)
                    break
            except Exception as e:
                retries -= 1
                print(f"Chunk failed ({e}), retries left: {retries}")
                time.sleep(1.5)

        if not results:
            print(f"Failed chunk, using original titles as fallback.")
            results = titles_chunk

        for (book_idx, _), trans in zip(chunk, results):
            catalog[book_idx]["chineseTitle"] = clean_title_str(trans)

        time.sleep(0.3)

    # 3. Final sanity check: ensure no book has empty chineseTitle
    empty_count = 0
    for book in catalog:
        if not book.get("chineseTitle") or not book["chineseTitle"].strip():
            empty_count += 1
            book["chineseTitle"] = book.get("title", "未命名名著")

    print(f"Translation complete! Empty titles remaining: {empty_count}")

    # 4. Save updated catalog
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    print(f"Successfully saved updated catalog to {CATALOG_PATH}")

if __name__ == "__main__":
    main()
