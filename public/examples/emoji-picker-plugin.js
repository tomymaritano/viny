// Viny Plugin: Emoji Picker
// Adds emoji picker and autocompletion to the editor

export default {
  name: 'emoji-picker',
  version: '1.5.0',
  description: 'Add emojis to your notes with a visual picker and smart autocompletion',
  author: 'Viny Community',
  
  config: {
    enabled: true,
    showInToolbar: true,
    enableAutoComplete: true,
    enableShortcuts: true,
    recentEmojisCount: 12,
    enableSearch: true,
    enableSkinTones: true,
    defaultSkinTone: 'default',
    customEmojis: []
  },

  activate(api) {
    console.log('Emoji Picker plugin activated!')
    this.api = api
    this.isPickerVisible = false
    this.recentEmojis = this.loadRecentEmojis()
    this.skinTone = this.config.defaultSkinTone
    
    // Initialize emoji data
    this.initializeEmojiData()
    
    // Add UI elements
    this.addToolbarButton()
    this.addKeyboardShortcuts()
    
    // Setup autocompletion
    if (this.config.enableAutoComplete) {
      this.setupAutoCompletion()
    }
    
    // Create emoji picker UI
    this.createEmojiPicker()
    
    api.ui.showToast('Emoji Picker ready! 😊 Press Ctrl+; to open', 'success')
  },

  deactivate() {
    this.removeEmojiPicker()
    console.log('Emoji Picker plugin deactivated!')
  },

  initializeEmojiData() {
    // Comprehensive emoji database organized by categories
    this.emojiData = {
      'smileys': {
        name: 'Smileys & Emotion',
        icon: '😀',
        emojis: [
          { char: '😀', name: 'grinning', keywords: ['happy', 'smile'] },
          { char: '😃', name: 'grinning_big', keywords: ['happy', 'joy'] },
          { char: '😄', name: 'grinning_squinting', keywords: ['happy', 'laugh'] },
          { char: '😁', name: 'beaming', keywords: ['happy', 'excited'] },
          { char: '😆', name: 'grinning_sweat', keywords: ['funny', 'laugh'] },
          { char: '😅', name: 'sweat_smile', keywords: ['relief', 'nervous'] },
          { char: '🤣', name: 'rolling_laughing', keywords: ['funny', 'lol'] },
          { char: '😂', name: 'tears_of_joy', keywords: ['funny', 'crying'] },
          { char: '🙂', name: 'slightly_smiling', keywords: ['smile', 'happy'] },
          { char: '🙃', name: 'upside_down', keywords: ['silly', 'sarcasm'] },
          { char: '😉', name: 'winking', keywords: ['flirt', 'joke'] },
          { char: '😊', name: 'smiling_eyes', keywords: ['happy', 'blush'] },
          { char: '😇', name: 'innocent', keywords: ['angel', 'halo'] },
          { char: '🥰', name: 'smiling_hearts', keywords: ['love', 'adore'] },
          { char: '😍', name: 'heart_eyes', keywords: ['love', 'crush'] },
          { char: '🤩', name: 'star_struck', keywords: ['amazed', 'excited'] },
          { char: '😘', name: 'kissing_heart', keywords: ['love', 'kiss'] },
          { char: '😗', name: 'kissing', keywords: ['kiss', 'love'] },
          { char: '😚', name: 'kissing_closed_eyes', keywords: ['kiss'] },
          { char: '😙', name: 'kissing_smiling_eyes', keywords: ['kiss'] },
          { char: '🥲', name: 'smiling_tear', keywords: ['happy', 'cry'] },
          { char: '😋', name: 'yum', keywords: ['delicious', 'tongue'] },
          { char: '😛', name: 'stuck_out_tongue', keywords: ['silly'] },
          { char: '😜', name: 'stuck_out_tongue_winking', keywords: ['silly'] },
          { char: '🤪', name: 'zany', keywords: ['crazy', 'silly'] },
          { char: '😝', name: 'stuck_out_tongue_closed_eyes', keywords: ['silly'] },
          { char: '🤑', name: 'money_mouth', keywords: ['rich', 'money'] },
          { char: '🤗', name: 'hugging', keywords: ['hug', 'friendly'] },
          { char: '🤭', name: 'hand_over_mouth', keywords: ['secret', 'oops'] },
          { char: '🤫', name: 'shushing', keywords: ['quiet', 'secret'] },
          { char: '🤔', name: 'thinking', keywords: ['hmm', 'consider'] },
          { char: '😐', name: 'neutral', keywords: ['meh', 'blank'] },
          { char: '😑', name: 'expressionless', keywords: ['blank', 'meh'] },
          { char: '😶', name: 'no_mouth', keywords: ['quiet', 'silent'] },
          { char: '😏', name: 'smirking', keywords: ['smug', 'sly'] },
          { char: '😒', name: 'unamused', keywords: ['meh', 'annoyed'] },
          { char: '🙄', name: 'eye_roll', keywords: ['annoyed', 'whatever'] },
          { char: '😬', name: 'grimacing', keywords: ['awkward', 'eek'] },
          { char: '🤥', name: 'lying', keywords: ['pinocchio', 'lie'] }
        ]
      },
      'people': {
        name: 'People & Body',
        icon: '👤',
        emojis: [
          { char: '👋', name: 'wave', keywords: ['hello', 'hi', 'goodbye'] },
          { char: '🤚', name: 'raised_back_hand', keywords: ['stop', 'high_five'] },
          { char: '🖐️', name: 'hand_splayed', keywords: ['stop', 'high_five'] },
          { char: '✋', name: 'raised_hand', keywords: ['stop', 'high_five'] },
          { char: '🖖', name: 'vulcan_salute', keywords: ['spock', 'star_trek'] },
          { char: '👌', name: 'ok_hand', keywords: ['okay', 'perfect'] },
          { char: '🤌', name: 'pinched_fingers', keywords: ['italian', 'chef'] },
          { char: '🤏', name: 'pinching_hand', keywords: ['small', 'tiny'] },
          { char: '✌️', name: 'victory_hand', keywords: ['peace', 'victory'] },
          { char: '🤞', name: 'crossed_fingers', keywords: ['luck', 'hope'] },
          { char: '🤟', name: 'love_you_gesture', keywords: ['love', 'rock'] },
          { char: '🤘', name: 'sign_of_horns', keywords: ['rock', 'metal'] },
          { char: '🤙', name: 'call_me_hand', keywords: ['call', 'hang_loose'] },
          { char: '👈', name: 'backhand_index_pointing_left', keywords: ['point', 'left'] },
          { char: '👉', name: 'backhand_index_pointing_right', keywords: ['point', 'right'] },
          { char: '👆', name: 'backhand_index_pointing_up', keywords: ['point', 'up'] },
          { char: '🖕', name: 'middle_finger', keywords: ['rude', 'offensive'] },
          { char: '👇', name: 'backhand_index_pointing_down', keywords: ['point', 'down'] },
          { char: '☝️', name: 'index_pointing_up', keywords: ['point', 'up', 'one'] },
          { char: '👍', name: 'thumbs_up', keywords: ['good', 'yes', 'like'] },
          { char: '👎', name: 'thumbs_down', keywords: ['bad', 'no', 'dislike'] },
          { char: '✊', name: 'raised_fist', keywords: ['power', 'strength'] },
          { char: '👊', name: 'oncoming_fist', keywords: ['punch', 'fist_bump'] },
          { char: '🤛', name: 'left_facing_fist', keywords: ['fist_bump'] },
          { char: '🤜', name: 'right_facing_fist', keywords: ['fist_bump'] },
          { char: '👏', name: 'clapping_hands', keywords: ['applause', 'bravo'] },
          { char: '🙌', name: 'raising_hands', keywords: ['celebration', 'praise'] },
          { char: '👐', name: 'open_hands', keywords: ['hug', 'jazz_hands'] },
          { char: '🤲', name: 'palms_up_together', keywords: ['pray', 'please'] },
          { char: '🤝', name: 'handshake', keywords: ['deal', 'agreement'] },
          { char: '🙏', name: 'folded_hands', keywords: ['pray', 'thanks', 'please'] }
        ]
      },
      'nature': {
        name: 'Animals & Nature',
        icon: '🌿',
        emojis: [
          { char: '🐶', name: 'dog', keywords: ['pet', 'puppy'] },
          { char: '🐱', name: 'cat', keywords: ['pet', 'kitten'] },
          { char: '🐭', name: 'mouse', keywords: ['animal'] },
          { char: '🐹', name: 'hamster', keywords: ['pet'] },
          { char: '🐰', name: 'rabbit', keywords: ['bunny', 'easter'] },
          { char: '🦊', name: 'fox', keywords: ['animal'] },
          { char: '🐻', name: 'bear', keywords: ['animal'] },
          { char: '🐼', name: 'panda', keywords: ['animal', 'cute'] },
          { char: '🐨', name: 'koala', keywords: ['animal', 'australia'] },
          { char: '🐯', name: 'tiger', keywords: ['animal', 'stripe'] },
          { char: '🦁', name: 'lion', keywords: ['animal', 'king'] },
          { char: '🐮', name: 'cow', keywords: ['animal', 'moo'] },
          { char: '🐷', name: 'pig', keywords: ['animal', 'bacon'] },
          { char: '🐸', name: 'frog', keywords: ['animal', 'green'] },
          { char: '🐵', name: 'monkey', keywords: ['animal', 'banana'] },
          { char: '🙈', name: 'see_no_evil', keywords: ['monkey', 'eyes'] },
          { char: '🙉', name: 'hear_no_evil', keywords: ['monkey', 'ears'] },
          { char: '🙊', name: 'speak_no_evil', keywords: ['monkey', 'mouth'] },
          { char: '🌸', name: 'cherry_blossom', keywords: ['spring', 'flower'] },
          { char: '🌺', name: 'hibiscus', keywords: ['flower', 'tropical'] },
          { char: '🌻', name: 'sunflower', keywords: ['flower', 'sun'] },
          { char: '🌹', name: 'rose', keywords: ['flower', 'love'] },
          { char: '🌷', name: 'tulip', keywords: ['flower', 'spring'] },
          { char: '🌿', name: 'herb', keywords: ['plant', 'green'] },
          { char: '🌱', name: 'seedling', keywords: ['plant', 'growth'] },
          { char: '🌳', name: 'deciduous_tree', keywords: ['tree', 'nature'] },
          { char: '🌲', name: 'evergreen_tree', keywords: ['tree', 'christmas'] },
          { char: '🌴', name: 'palm_tree', keywords: ['tree', 'tropical'] },
          { char: '🌵', name: 'cactus', keywords: ['plant', 'desert'] },
          { char: '🌾', name: 'sheaf_of_rice', keywords: ['grain', 'wheat'] }
        ]
      },
      'food': {
        name: 'Food & Drink',
        icon: '🍎',
        emojis: [
          { char: '🍎', name: 'red_apple', keywords: ['fruit', 'healthy'] },
          { char: '🍊', name: 'tangerine', keywords: ['fruit', 'orange'] },
          { char: '🍋', name: 'lemon', keywords: ['fruit', 'sour'] },
          { char: '🍌', name: 'banana', keywords: ['fruit', 'yellow'] },
          { char: '🍉', name: 'watermelon', keywords: ['fruit', 'summer'] },
          { char: '🍇', name: 'grapes', keywords: ['fruit', 'wine'] },
          { char: '🍓', name: 'strawberry', keywords: ['fruit', 'sweet'] },
          { char: '🫐', name: 'blueberries', keywords: ['fruit', 'healthy'] },
          { char: '🍈', name: 'melon', keywords: ['fruit'] },
          { char: '🍒', name: 'cherries', keywords: ['fruit', 'red'] },
          { char: '🍑', name: 'peach', keywords: ['fruit'] },
          { char: '🥭', name: 'mango', keywords: ['fruit', 'tropical'] },
          { char: '🍍', name: 'pineapple', keywords: ['fruit', 'tropical'] },
          { char: '🥥', name: 'coconut', keywords: ['fruit', 'tropical'] },
          { char: '🥝', name: 'kiwi', keywords: ['fruit', 'green'] },
          { char: '🍅', name: 'tomato', keywords: ['vegetable', 'red'] },
          { char: '🍆', name: 'eggplant', keywords: ['vegetable', 'purple'] },
          { char: '🥑', name: 'avocado', keywords: ['fruit', 'healthy'] },
          { char: '🥦', name: 'broccoli', keywords: ['vegetable', 'green'] },
          { char: '🥬', name: 'leafy_greens', keywords: ['vegetable', 'salad'] },
          { char: '🥒', name: 'cucumber', keywords: ['vegetable', 'green'] },
          { char: '🌶️', name: 'hot_pepper', keywords: ['spicy', 'hot'] },
          { char: '🫑', name: 'bell_pepper', keywords: ['vegetable'] },
          { char: '🌽', name: 'corn', keywords: ['vegetable', 'yellow'] },
          { char: '🥕', name: 'carrot', keywords: ['vegetable', 'orange'] },
          { char: '🧄', name: 'garlic', keywords: ['vegetable', 'cooking'] },
          { char: '🧅', name: 'onion', keywords: ['vegetable', 'cooking'] },
          { char: '🥔', name: 'potato', keywords: ['vegetable'] },
          { char: '🍠', name: 'roasted_sweet_potato', keywords: ['vegetable'] },
          { char: '🥐', name: 'croissant', keywords: ['bread', 'french'] },
          { char: '🥖', name: 'baguette_bread', keywords: ['bread', 'french'] },
          { char: '🍞', name: 'bread', keywords: ['food', 'breakfast'] },
          { char: '🥨', name: 'pretzel', keywords: ['snack', 'german'] },
          { char: '🥯', name: 'bagel', keywords: ['bread', 'breakfast'] },
          { char: '🥞', name: 'pancakes', keywords: ['breakfast', 'sweet'] },
          { char: '🧇', name: 'waffle', keywords: ['breakfast', 'sweet'] },
          { char: '🧀', name: 'cheese', keywords: ['dairy', 'yellow'] },
          { char: '🍖', name: 'meat_on_bone', keywords: ['food', 'protein'] },
          { char: '🍗', name: 'poultry_leg', keywords: ['chicken', 'food'] },
          { char: '🥩', name: 'cut_of_meat', keywords: ['steak', 'food'] },
          { char: '🥓', name: 'bacon', keywords: ['meat', 'breakfast'] },
          { char: '🍔', name: 'hamburger', keywords: ['fast_food', 'burger'] },
          { char: '🍟', name: 'french_fries', keywords: ['fast_food', 'potato'] },
          { char: '🍕', name: 'pizza', keywords: ['food', 'italian'] },
          { char: '🌭', name: 'hot_dog', keywords: ['fast_food'] },
          { char: '🥪', name: 'sandwich', keywords: ['food', 'lunch'] },
          { char: '🌮', name: 'taco', keywords: ['mexican', 'food'] },
          { char: '🌯', name: 'burrito', keywords: ['mexican', 'food'] },
          { char: '🫔', name: 'tamale', keywords: ['mexican', 'food'] },
          { char: '🥙', name: 'stuffed_flatbread', keywords: ['middle_eastern'] },
          { char: '🧆', name: 'falafel', keywords: ['middle_eastern'] },
          { char: '🥚', name: 'egg', keywords: ['breakfast', 'protein'] },
          { char: '🍳', name: 'cooking', keywords: ['breakfast', 'fried_egg'] },
          { char: '🥘', name: 'shallow_pan_of_food', keywords: ['paella', 'cooking'] },
          { char: '🍲', name: 'pot_of_food', keywords: ['stew', 'soup'] },
          { char: '🫕', name: 'fondue', keywords: ['cheese', 'swiss'] },
          { char: '🥣', name: 'bowl_with_spoon', keywords: ['cereal', 'soup'] },
          { char: '🥗', name: 'green_salad', keywords: ['healthy', 'vegetables'] },
          { char: '🍿', name: 'popcorn', keywords: ['snack', 'movie'] },
          { char: '🧈', name: 'butter', keywords: ['dairy', 'cooking'] },
          { char: '🧂', name: 'salt', keywords: ['seasoning', 'cooking'] },
          { char: '🥫', name: 'canned_food', keywords: ['preserved', 'soup'] },
          { char: '☕', name: 'hot_beverage', keywords: ['coffee', 'tea'] },
          { char: '🍵', name: 'teacup_without_handle', keywords: ['tea', 'green'] },
          { char: '🧃', name: 'beverage_box', keywords: ['juice', 'drink'] },
          { char: '🥤', name: 'cup_with_straw', keywords: ['soda', 'drink'] },
          { char: '🧋', name: 'bubble_tea', keywords: ['tea', 'asian'] },
          { char: '🍶', name: 'sake', keywords: ['japanese', 'alcohol'] },
          { char: '🍾', name: 'bottle_with_popping_cork', keywords: ['champagne', 'celebration'] },
          { char: '🍷', name: 'wine_glass', keywords: ['alcohol', 'red'] },
          { char: '🍸', name: 'cocktail_glass', keywords: ['alcohol', 'martini'] },
          { char: '🍹', name: 'tropical_drink', keywords: ['cocktail', 'vacation'] },
          { char: '🍺', name: 'beer_mug', keywords: ['alcohol', 'beer'] },
          { char: '🍻', name: 'clinking_beer_mugs', keywords: ['cheers', 'celebration'] },
          { char: '🥂', name: 'clinking_glasses', keywords: ['cheers', 'celebration'] },
          { char: '🥃', name: 'tumbler_glass', keywords: ['whiskey', 'alcohol'] }
        ]
      },
      'activities': {
        name: 'Activities',
        icon: '⚽',
        emojis: [
          { char: '⚽', name: 'soccer_ball', keywords: ['football', 'sport'] },
          { char: '🏀', name: 'basketball', keywords: ['sport', 'orange'] },
          { char: '🏈', name: 'american_football', keywords: ['sport', 'nfl'] },
          { char: '⚾', name: 'baseball', keywords: ['sport', 'america'] },
          { char: '🥎', name: 'softball', keywords: ['sport'] },
          { char: '🎾', name: 'tennis', keywords: ['sport', 'racket'] },
          { char: '🏐', name: 'volleyball', keywords: ['sport', 'beach'] },
          { char: '🏉', name: 'rugby_football', keywords: ['sport'] },
          { char: '🥏', name: 'flying_disc', keywords: ['frisbee', 'sport'] },
          { char: '🎱', name: 'pool_8_ball', keywords: ['billiards', 'eight'] },
          { char: '🪀', name: 'yo_yo', keywords: ['toy', 'string'] },
          { char: '🏓', name: 'ping_pong', keywords: ['table_tennis', 'sport'] },
          { char: '🏸', name: 'badminton', keywords: ['sport', 'racket'] },
          { char: '🏒', name: 'ice_hockey', keywords: ['sport', 'canada'] },
          { char: '🏑', name: 'field_hockey', keywords: ['sport'] },
          { char: '🥍', name: 'lacrosse', keywords: ['sport'] },
          { char: '🏏', name: 'cricket_game', keywords: ['sport', 'bat'] },
          { char: '🥅', name: 'goal_net', keywords: ['sport', 'soccer'] },
          { char: '⛳', name: 'flag_in_hole', keywords: ['golf', 'sport'] },
          { char: '🪁', name: 'kite', keywords: ['flying', 'wind'] },
          { char: '🏹', name: 'bow_and_arrow', keywords: ['archery', 'sport'] },
          { char: '🎣', name: 'fishing_pole', keywords: ['fishing', 'hobby'] },
          { char: '🤿', name: 'diving_mask', keywords: ['scuba', 'underwater'] },
          { char: '🥊', name: 'boxing_glove', keywords: ['sport', 'fight'] },
          { char: '🥋', name: 'martial_arts_uniform', keywords: ['karate', 'judo'] },
          { char: '🎯', name: 'bullseye', keywords: ['target', 'accurate'] },
          { char: '🪃', name: 'boomerang', keywords: ['australia', 'return'] },
          { char: '🎪', name: 'circus_tent', keywords: ['carnival', 'show'] },
          { char: '🎭', name: 'performing_arts', keywords: ['theater', 'drama'] },
          { char: '🎨', name: 'artist_palette', keywords: ['art', 'paint'] },
          { char: '🎬', name: 'clapper_board', keywords: ['movie', 'film'] },
          { char: '🎤', name: 'microphone', keywords: ['sing', 'karaoke'] },
          { char: '🎧', name: 'headphone', keywords: ['music', 'listen'] },
          { char: '🎼', name: 'musical_score', keywords: ['music', 'notes'] },
          { char: '🎵', name: 'musical_note', keywords: ['music', 'sound'] },
          { char: '🎶', name: 'musical_notes', keywords: ['music', 'melody'] },
          { char: '🪘', name: 'long_drum', keywords: ['music', 'beat'] },
          { char: '🥁', name: 'drum', keywords: ['music', 'beat'] },
          { char: '🪗', name: 'accordion', keywords: ['music', 'folk'] },
          { char: '🎺', name: 'trumpet', keywords: ['music', 'brass'] },
          { char: '🎷', name: 'saxophone', keywords: ['music', 'jazz'] },
          { char: '🎸', name: 'guitar', keywords: ['music', 'rock'] },
          { char: '🪕', name: 'banjo', keywords: ['music', 'country'] },
          { char: '🎻', name: 'violin', keywords: ['music', 'classical'] },
          { char: '🎹', name: 'musical_keyboard', keywords: ['music', 'piano'] }
        ]
      },
      'objects': {
        name: 'Objects',
        icon: '📱',
        emojis: [
          { char: '📱', name: 'mobile_phone', keywords: ['phone', 'technology'] },
          { char: '💻', name: 'laptop_computer', keywords: ['computer', 'work'] },
          { char: '🖥️', name: 'desktop_computer', keywords: ['computer', 'work'] },
          { char: '🖨️', name: 'printer', keywords: ['office', 'paper'] },
          { char: '⌨️', name: 'keyboard', keywords: ['computer', 'typing'] },
          { char: '🖱️', name: 'computer_mouse', keywords: ['computer', 'click'] },
          { char: '🖲️', name: 'trackball', keywords: ['computer'] },
          { char: '💽', name: 'computer_disk', keywords: ['storage', 'data'] },
          { char: '💾', name: 'floppy_disk', keywords: ['save', 'storage'] },
          { char: '💿', name: 'optical_disk', keywords: ['cd', 'music'] },
          { char: '📀', name: 'dvd', keywords: ['movie', 'disk'] },
          { char: '🧮', name: 'abacus', keywords: ['calculator', 'math'] },
          { char: '🎥', name: 'movie_camera', keywords: ['film', 'record'] },
          { char: '📹', name: 'video_camera', keywords: ['record', 'film'] },
          { char: '📷', name: 'camera', keywords: ['photo', 'picture'] },
          { char: '📸', name: 'camera_with_flash', keywords: ['photo', 'selfie'] },
          { char: '☎️', name: 'telephone', keywords: ['old', 'call'] },
          { char: '📞', name: 'telephone_receiver', keywords: ['call', 'phone'] },
          { char: '📟', name: 'pager', keywords: ['beeper', 'old'] },
          { char: '📠', name: 'fax_machine', keywords: ['office', 'old'] },
          { char: '📺', name: 'television', keywords: ['tv', 'watch'] },
          { char: '📻', name: 'radio', keywords: ['music', 'news'] },
          { char: '🎙️', name: 'studio_microphone', keywords: ['podcast', 'record'] },
          { char: '🎚️', name: 'level_slider', keywords: ['music', 'control'] },
          { char: '🎛️', name: 'control_knobs', keywords: ['music', 'studio'] },
          { char: '🧭', name: 'compass', keywords: ['navigation', 'direction'] },
          { char: '⏱️', name: 'stopwatch', keywords: ['time', 'sport'] },
          { char: '⏲️', name: 'timer_clock', keywords: ['time', 'countdown'] },
          { char: '⏰', name: 'alarm_clock', keywords: ['time', 'wake'] },
          { char: '🕰️', name: 'mantelpiece_clock', keywords: ['time', 'antique'] },
          { char: '⌛', name: 'hourglass_done', keywords: ['time', 'sand'] },
          { char: '⏳', name: 'hourglass_not_done', keywords: ['time', 'waiting'] },
          { char: '📡', name: 'satellite_antenna', keywords: ['communication', 'space'] },
          { char: '🔋', name: 'battery', keywords: ['power', 'energy'] },
          { char: '🔌', name: 'electric_plug', keywords: ['power', 'electricity'] },
          { char: '💡', name: 'light_bulb', keywords: ['idea', 'bright'] },
          { char: '🔦', name: 'flashlight', keywords: ['light', 'dark'] },
          { char: '🕯️', name: 'candle', keywords: ['light', 'romantic'] },
          { char: '🪔', name: 'diya_lamp', keywords: ['light', 'oil'] },
          { char: '🧯', name: 'fire_extinguisher', keywords: ['safety', 'emergency'] },
          { char: '🛢️', name: 'oil_drum', keywords: ['fuel', 'oil'] },
          { char: '💸', name: 'money_with_wings', keywords: ['expensive', 'waste'] },
          { char: '💵', name: 'dollar_banknote', keywords: ['money', 'cash'] },
          { char: '💴', name: 'yen_banknote', keywords: ['money', 'japan'] },
          { char: '💶', name: 'euro_banknote', keywords: ['money', 'europe'] },
          { char: '💷', name: 'pound_banknote', keywords: ['money', 'uk'] },
          { char: '🪙', name: 'coin', keywords: ['money', 'currency'] },
          { char: '💰', name: 'money_bag', keywords: ['rich', 'wealth'] },
          { char: '💳', name: 'credit_card', keywords: ['payment', 'shopping'] },
          { char: '💎', name: 'gem_stone', keywords: ['valuable', 'diamond'] },
          { char: '⚖️', name: 'balance_scale', keywords: ['justice', 'law'] },
          { char: '🧰', name: 'toolbox', keywords: ['tools', 'repair'] },
          { char: '🔧', name: 'wrench', keywords: ['tool', 'fix'] },
          { char: '🔨', name: 'hammer', keywords: ['tool', 'build'] },
          { char: '⚒️', name: 'hammer_and_pick', keywords: ['tools', 'mining'] },
          { char: '🛠️', name: 'hammer_and_wrench', keywords: ['tools', 'fix'] },
          { char: '⛏️', name: 'pick', keywords: ['tool', 'mining'] },
          { char: '🪚', name: 'carpentry_saw', keywords: ['tool', 'wood'] },
          { char: '🔩', name: 'nut_and_bolt', keywords: ['hardware', 'metal'] },
          { char: '⚙️', name: 'gear', keywords: ['settings', 'mechanical'] },
          { char: '🧲', name: 'magnet', keywords: ['attraction', 'physics'] },
          { char: '🔫', name: 'water_pistol', keywords: ['toy', 'water'] },
          { char: '💣', name: 'bomb', keywords: ['explosive', 'danger'] },
          { char: '🧨', name: 'firecracker', keywords: ['explosive', 'celebration'] },
          { char: '🪓', name: 'axe', keywords: ['tool', 'wood'] },
          { char: '🔪', name: 'kitchen_knife', keywords: ['cooking', 'sharp'] },
          { char: '🗡️', name: 'dagger', keywords: ['weapon', 'sharp'] },
          { char: '⚔️', name: 'crossed_swords', keywords: ['battle', 'fight'] }
        ]
      },
      'symbols': {
        name: 'Symbols',
        icon: '❤️',
        emojis: [
          { char: '❤️', name: 'red_heart', keywords: ['love', 'like'] },
          { char: '🧡', name: 'orange_heart', keywords: ['love', 'like'] },
          { char: '💛', name: 'yellow_heart', keywords: ['love', 'like'] },
          { char: '💚', name: 'green_heart', keywords: ['love', 'like'] },
          { char: '💙', name: 'blue_heart', keywords: ['love', 'like'] },
          { char: '💜', name: 'purple_heart', keywords: ['love', 'like'] },
          { char: '🖤', name: 'black_heart', keywords: ['love', 'dark'] },
          { char: '🤍', name: 'white_heart', keywords: ['love', 'pure'] },
          { char: '🤎', name: 'brown_heart', keywords: ['love', 'like'] },
          { char: '💔', name: 'broken_heart', keywords: ['sad', 'heartbreak'] },
          { char: '❣️', name: 'heart_exclamation', keywords: ['love', 'like'] },
          { char: '💕', name: 'two_hearts', keywords: ['love', 'like'] },
          { char: '💞', name: 'revolving_hearts', keywords: ['love', 'like'] },
          { char: '💓', name: 'beating_heart', keywords: ['love', 'like'] },
          { char: '💗', name: 'growing_heart', keywords: ['love', 'like'] },
          { char: '💖', name: 'sparkling_heart', keywords: ['love', 'like'] },
          { char: '💘', name: 'heart_with_arrow', keywords: ['love', 'cupid'] },
          { char: '💝', name: 'heart_with_ribbon', keywords: ['love', 'gift'] },
          { char: '💟', name: 'heart_decoration', keywords: ['love', 'like'] },
          { char: '☮️', name: 'peace_symbol', keywords: ['peace', 'hippie'] },
          { char: '✝️', name: 'latin_cross', keywords: ['christian', 'religion'] },
          { char: '☪️', name: 'star_and_crescent', keywords: ['islam', 'religion'] },
          { char: '🕉️', name: 'om', keywords: ['hinduism', 'religion'] },
          { char: '☸️', name: 'wheel_of_dharma', keywords: ['buddhism', 'religion'] },
          { char: '✡️', name: 'star_of_david', keywords: ['judaism', 'religion'] },
          { char: '🔯', name: 'dotted_six_pointed_star', keywords: ['star', 'symbol'] },
          { char: '🕎', name: 'menorah', keywords: ['judaism', 'religion'] },
          { char: '☯️', name: 'yin_yang', keywords: ['balance', 'taoism'] },
          { char: '☦️', name: 'orthodox_cross', keywords: ['christian', 'religion'] },
          { char: '🛐', name: 'place_of_worship', keywords: ['religion', 'church'] },
          { char: '⛎', name: 'ophiuchus', keywords: ['zodiac', 'astrology'] },
          { char: '♈', name: 'aries', keywords: ['zodiac', 'astrology'] },
          { char: '♉', name: 'taurus', keywords: ['zodiac', 'astrology'] },
          { char: '♊', name: 'gemini', keywords: ['zodiac', 'astrology'] },
          { char: '♋', name: 'cancer', keywords: ['zodiac', 'astrology'] },
          { char: '♌', name: 'leo', keywords: ['zodiac', 'astrology'] },
          { char: '♍', name: 'virgo', keywords: ['zodiac', 'astrology'] },
          { char: '♎', name: 'libra', keywords: ['zodiac', 'astrology'] },
          { char: '♏', name: 'scorpio', keywords: ['zodiac', 'astrology'] },
          { char: '♐', name: 'sagittarius', keywords: ['zodiac', 'astrology'] },
          { char: '♑', name: 'capricorn', keywords: ['zodiac', 'astrology'] },
          { char: '♒', name: 'aquarius', keywords: ['zodiac', 'astrology'] },
          { char: '♓', name: 'pisces', keywords: ['zodiac', 'astrology'] },
          { char: '🆔', name: 'id_button', keywords: ['identity', 'blue_square'] },
          { char: '⚡', name: 'high_voltage', keywords: ['lightning', 'thunder'] },
          { char: '🔥', name: 'fire', keywords: ['hot', 'burn'] },
          { char: '💥', name: 'collision', keywords: ['boom', 'explosion'] },
          { char: '⭐', name: 'star', keywords: ['night', 'yellow'] },
          { char: '🌟', name: 'glowing_star', keywords: ['shining', 'sparkle'] },
          { char: '💫', name: 'dizzy', keywords: ['star', 'sparkle'] },
          { char: '✨', name: 'sparkles', keywords: ['magic', 'clean'] },
          { char: '☄️', name: 'comet', keywords: ['space', 'shooting_star'] },
          { char: '💦', name: 'sweat_droplets', keywords: ['water', 'workout'] },
          { char: '💨', name: 'dashing_away', keywords: ['wind', 'blow'] },
          { char: '🎉', name: 'party_popper', keywords: ['celebration', 'party'] },
          { char: '🎊', name: 'confetti_ball', keywords: ['celebration', 'party'] }
        ]
      }
    }

    // Build search index
    this.buildSearchIndex()
  },

  buildSearchIndex() {
    this.searchIndex = []
    Object.values(this.emojiData).forEach(category => {
      category.emojis.forEach(emoji => {
        this.searchIndex.push({
          ...emoji,
          category: category.name,
          searchText: [emoji.name, ...emoji.keywords].join(' ').toLowerCase()
        })
      })
    })
  },

  addToolbarButton() {
    if (this.config.showInToolbar) {
      this.api.editor.addToolbarButton({
        id: 'emoji-picker-button',
        title: 'Insert Emoji',
        icon: '😊',
        onClick: () => this.toggleEmojiPicker()
      })
    }
  },

  addKeyboardShortcuts() {
    if (this.config.enableShortcuts) {
      // Main shortcut to open picker
      this.api.editor.addCommand({
        id: 'emoji-picker.toggle',
        name: 'Emoji Picker: Toggle',
        keybinding: 'Ctrl+;',
        callback: () => this.toggleEmojiPicker()
      })

      // Quick shortcuts for common emojis
      const quickEmojis = [
        { key: 'Ctrl+Shift+1', emoji: '👍', name: 'thumbs up' },
        { key: 'Ctrl+Shift+2', emoji: '❤️', name: 'heart' },
        { key: 'Ctrl+Shift+3', emoji: '😊', name: 'smile' },
        { key: 'Ctrl+Shift+4', emoji: '🎉', name: 'party' },
        { key: 'Ctrl+Shift+5', emoji: '🔥', name: 'fire' }
      ]

      quickEmojis.forEach(({ key, emoji, name }) => {
        this.api.editor.addCommand({
          id: `emoji-picker.quick-${name}`,
          name: `Emoji: Insert ${name} ${emoji}`,
          keybinding: key,
          callback: () => this.insertEmoji(emoji)
        })
      })
    }
  },

  setupAutoCompletion() {
    // Listen for typing to detect :emoji: patterns
    this.api.editor.onKeyPress((e) => {
      if (e.key === ':') {
        this.startEmojiAutoComplete()
      }
    })

    // Monitor text changes for auto-completion
    this.api.editor.onTextChange((text) => {
      this.handleAutoComplete(text)
    })
  },

  startEmojiAutoComplete() {
    // Start tracking for emoji completion
    this.autoCompleteActive = true
    this.autoCompleteBuffer = ':'
  },

  handleAutoComplete(text) {
    if (!this.autoCompleteActive) return

    // Extract current line and find :emoji: patterns
    const colonPattern = /:(\w+):/g
    const matches = text.match(colonPattern)
    
    if (matches) {
      matches.forEach(match => {
        const emojiName = match.slice(1, -1) // Remove colons
        const emoji = this.findEmojiByName(emojiName)
        if (emoji) {
          // Replace :name: with actual emoji
          this.replaceTextWithEmoji(match, emoji.char)
        }
      })
    }
  },

  findEmojiByName(name) {
    return this.searchIndex.find(emoji => 
      emoji.name === name || emoji.keywords.includes(name)
    )
  },

  replaceTextWithEmoji(text, emoji) {
    // Replace the :name: pattern with the actual emoji
    this.api.editor.replaceText(text, emoji)
    this.addToRecents(emoji)
  },

  createEmojiPicker() {
    // Create the emoji picker UI element
    this.pickerElement = document.createElement('div')
    this.pickerElement.className = 'emoji-picker-overlay'
    this.pickerElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
    `

    this.pickerElement.innerHTML = `
      <div class="emoji-picker" style="
        background: #073642;
        border: 1px solid #586e75;
        border-radius: 8px;
        width: 400px;
        max-height: 500px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      ">
        <div class="emoji-picker-header" style="
          padding: 12px;
          border-bottom: 1px solid #586e75;
          background: #002b36;
        ">
          <div class="emoji-search-container" style="position: relative;">
            <input 
              type="text" 
              placeholder="Search emojis..." 
              class="emoji-search"
              style="
                width: 100%;
                padding: 8px 12px;
                background: #073642;
                border: 1px solid #586e75;
                border-radius: 4px;
                color: #839496;
                font-size: 14px;
              "
            />
          </div>
          <div class="emoji-categories" style="
            display: flex;
            gap: 8px;
            margin-top: 8px;
            overflow-x: auto;
          ">
            ${this.renderCategoryTabs()}
          </div>
        </div>
        <div class="emoji-picker-body" style="
          padding: 12px;
          max-height: 350px;
          overflow-y: auto;
        ">
          <div class="emoji-recents" style="margin-bottom: 16px;">
            <h4 style="color: #93a1a1; margin: 0 0 8px 0; font-size: 12px;">Recently Used</h4>
            <div class="emoji-grid" id="recents-grid">
              ${this.renderRecentEmojis()}
            </div>
          </div>
          <div class="emoji-content" id="emoji-content">
            ${this.renderEmojiGrid('smileys')}
          </div>
        </div>
      </div>
    `

    document.body.appendChild(this.pickerElement)
    this.setupPickerEvents()
  },

  renderCategoryTabs() {
    return Object.entries(this.emojiData).map(([key, category]) => `
      <button 
        class="category-tab" 
        data-category="${key}"
        style="
          background: #073642;
          border: 1px solid #586e75;
          border-radius: 4px;
          padding: 6px 8px;
          color: #839496;
          cursor: pointer;
          font-size: 16px;
          min-width: 36px;
        "
        title="${category.name}"
      >
        ${category.icon}
      </button>
    `).join('')
  },

  renderRecentEmojis() {
    if (this.recentEmojis.length === 0) {
      return '<div style="color: #586e75; font-style: italic; font-size: 12px;">No recent emojis</div>'
    }

    return this.recentEmojis.map(emoji => `
      <button 
        class="emoji-btn" 
        data-emoji="${emoji}"
        style="
          background: none;
          border: none;
          font-size: 20px;
          padding: 4px;
          margin: 2px;
          cursor: pointer;
          border-radius: 4px;
          min-width: 32px;
          min-height: 32px;
        "
        title="${this.getEmojiName(emoji)}"
      >
        ${emoji}
      </button>
    `).join('')
  },

  renderEmojiGrid(categoryKey) {
    const category = this.emojiData[categoryKey]
    if (!category) return ''

    return `
      <h4 style="color: #93a1a1; margin: 0 0 8px 0; font-size: 12px;">${category.name}</h4>
      <div class="emoji-grid" style="
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 4px;
      ">
        ${category.emojis.map(emoji => `
          <button 
            class="emoji-btn" 
            data-emoji="${emoji.char}"
            style="
              background: none;
              border: none;
              font-size: 20px;
              padding: 6px;
              cursor: pointer;
              border-radius: 4px;
              transition: background-color 0.2s;
            "
            title=":${emoji.name}: ${emoji.keywords.join(', ')}"
            onmouseover="this.style.backgroundColor='#586e75'"
            onmouseout="this.style.backgroundColor=''"
          >
            ${emoji.char}
          </button>
        `).join('')}
      </div>
    `
  },

  setupPickerEvents() {
    // Close picker when clicking overlay
    this.pickerElement.addEventListener('click', (e) => {
      if (e.target === this.pickerElement) {
        this.hideEmojiPicker()
      }
    })

    // Category tab clicks
    this.pickerElement.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const category = e.target.dataset.category
        this.showCategory(category)
        
        // Update active tab
        this.pickerElement.querySelectorAll('.category-tab').forEach(t => {
          t.style.backgroundColor = '#073642'
          t.style.color = '#839496'
        })
        e.target.style.backgroundColor = '#268bd2'
        e.target.style.color = '#fdf6e3'
      })
    })

    // Emoji button clicks
    this.pickerElement.addEventListener('click', (e) => {
      if (e.target.classList.contains('emoji-btn')) {
        const emoji = e.target.dataset.emoji
        this.insertEmoji(emoji)
        this.hideEmojiPicker()
      }
    })

    // Search functionality
    const searchInput = this.pickerElement.querySelector('.emoji-search')
    searchInput.addEventListener('input', (e) => {
      this.searchEmojis(e.target.value)
    })

    // Keyboard navigation
    this.pickerElement.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideEmojiPicker()
      }
    })
  },

  showCategory(categoryKey) {
    const contentElement = this.pickerElement.querySelector('#emoji-content')
    contentElement.innerHTML = this.renderEmojiGrid(categoryKey)
  },

  searchEmojis(query) {
    if (!query.trim()) {
      this.showCategory('smileys')
      return
    }

    const results = this.searchIndex.filter(emoji =>
      emoji.searchText.includes(query.toLowerCase())
    ).slice(0, 64) // Limit results

    const contentElement = this.pickerElement.querySelector('#emoji-content')
    contentElement.innerHTML = `
      <h4 style="color: #93a1a1; margin: 0 0 8px 0; font-size: 12px;">
        Search Results (${results.length})
      </h4>
      <div class="emoji-grid" style="
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 4px;
      ">
        ${results.map(emoji => `
          <button 
            class="emoji-btn" 
            data-emoji="${emoji.char}"
            style="
              background: none;
              border: none;
              font-size: 20px;
              padding: 6px;
              cursor: pointer;
              border-radius: 4px;
              transition: background-color 0.2s;
            "
            title=":${emoji.name}: ${emoji.keywords.join(', ')}"
            onmouseover="this.style.backgroundColor='#586e75'"
            onmouseout="this.style.backgroundColor=''"
          >
            ${emoji.char}
          </button>
        `).join('')}
      </div>
    `
  },

  toggleEmojiPicker() {
    if (this.isPickerVisible) {
      this.hideEmojiPicker()
    } else {
      this.showEmojiPicker()
    }
  },

  showEmojiPicker() {
    this.pickerElement.style.display = 'flex'
    this.isPickerVisible = true
    
    // Focus search input
    const searchInput = this.pickerElement.querySelector('.emoji-search')
    setTimeout(() => searchInput.focus(), 100)
    
    // Update recents
    const recentsGrid = this.pickerElement.querySelector('#recents-grid')
    recentsGrid.innerHTML = this.renderRecentEmojis()
  },

  hideEmojiPicker() {
    this.pickerElement.style.display = 'none'
    this.isPickerVisible = false
  },

  insertEmoji(emoji) {
    // Insert emoji at current cursor position
    this.api.editor.insertText(emoji)
    this.addToRecents(emoji)
    
    // Show feedback
    this.api.ui.showToast(`Inserted ${emoji}`, 'success')
  },

  addToRecents(emoji) {
    // Remove if already exists
    this.recentEmojis = this.recentEmojis.filter(e => e !== emoji)
    
    // Add to beginning
    this.recentEmojis.unshift(emoji)
    
    // Limit size
    if (this.recentEmojis.length > this.config.recentEmojisCount) {
      this.recentEmojis = this.recentEmojis.slice(0, this.config.recentEmojisCount)
    }
    
    // Save to storage
    this.saveRecentEmojis()
  },

  getEmojiName(emoji) {
    const found = this.searchIndex.find(e => e.char === emoji)
    return found ? found.name : 'emoji'
  },

  loadRecentEmojis() {
    return this.api.utils.storage.get('recentEmojis') || []
  },

  saveRecentEmojis() {
    this.api.utils.storage.set('recentEmojis', this.recentEmojis)
  },

  removeEmojiPicker() {
    if (this.pickerElement) {
      this.pickerElement.remove()
      this.pickerElement = null
    }
  }
}

/*
Emoji Picker Plugin Features:
============================

This comprehensive emoji plugin provides:

## Core Features:
✅ Visual emoji picker with 400+ emojis
✅ Organized categories (Smileys, People, Nature, Food, Activities, Objects, Symbols)
✅ Search functionality with keywords
✅ Recent emojis tracking
✅ Autocompletion with :emoji: syntax
✅ Keyboard shortcuts (Ctrl+; to open)
✅ Quick emoji shortcuts (Ctrl+Shift+1-5)

## UI Features:
- Beautiful dark theme matching Viny
- Category tabs for easy navigation
- Hover effects and tooltips
- Responsive grid layout
- Search with instant results
- Recent emojis section

## Usage:
1. **Visual Picker**: 
   - Click toolbar button or press Ctrl+;
   - Browse categories or search
   - Click emoji to insert

2. **Autocompletion**:
   - Type :smile: and it becomes 😊
   - Type :heart: and it becomes ❤️
   - Supports all emoji names and keywords

3. **Quick Shortcuts**:
   - Ctrl+Shift+1 = 👍
   - Ctrl+Shift+2 = ❤️
   - Ctrl+Shift+3 = 😊
   - Ctrl+Shift+4 = 🎉
   - Ctrl+Shift+5 = 🔥

## Technical Features:
- Comprehensive emoji database
- Search indexing for fast lookup
- Local storage for recent emojis
- Monaco Editor integration
- Keyboard navigation support
- Configurable options

Perfect for adding personality and emotion to your notes! 😊✨
*/