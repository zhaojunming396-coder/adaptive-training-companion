const BODY_PARTS = {
  chest: true,
  back: true,
  shoulder: true,
  legs: true,
  glutes: true,
  arms: true,
  core: true,
  cardio: true,
  mobility: true
};

const CATEGORIES = {
  strength: true,
  cardio: true,
  mobility: true,
  warmup: true
};

const MOVEMENT_PATTERNS = {
  horizontal_push: true,
  vertical_push: true,
  horizontal_pull: true,
  vertical_pull: true,
  squat: true,
  hinge: true,
  lunge: true,
  hip_thrust: true,
  knee_extension: true,
  knee_flexion: true,
  elbow_flexion: true,
  elbow_extension: true,
  shoulder_abduction: true,
  core_anti_extension: true,
  core_flexion: true,
  core_rotation: true,
  cardio: true,
  mobility: true
};

const DIFFICULTY = {
  beginner: true,
  intermediate: true,
  advanced: true
};

const TRACKING_TYPES = {
  weight_reps: true,
  reps_only: true,
  time_based: true,
  distance_time: true
};

const REQUIRED_EXERCISE_FIELDS = [
  'id',
  'nameZh',
  'nameEn',
  'bodyPart',
  'category',
  'primaryMuscles',
  'secondaryMuscles',
  'movementPattern',
  'equipment',
  'difficulty',
  'recommendedFor',
  'goals',
  'recommendation',
  'progressionRule',
  'intensity',
  'media',
  'sourceRefs',
  'trackingType',
  'steps',
  'commonMistakes',
  'safetyTips',
  'alternativeExerciseIds',
  'isBeginnerFriendly',
  'isCoreLift',
  'isUnilateral',
  'isBodyweight',
  'contraindications'
];

function hasRecommendationValue(recommendation, field) {
  return Boolean(recommendation) && recommendation[field] !== undefined && recommendation[field] !== null;
}

export const exercises = [
  {
    "id": "db_bench_press",
    "nameZh": "哑铃卧推",
    "nameEn": "Dumbbell Bench Press",
    "bodyPart": "chest",
    "category": "strength",
    "primaryMuscles": [
      "胸大肌"
    ],
    "secondaryMuscles": [
      "肱三头肌",
      "三角肌前束"
    ],
    "movementPattern": "horizontal_push",
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "strength",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 8,
        "max": 12
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 90
    },
    "progressionRule": "double_progression",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "坐在训练凳上，将哑铃放在大腿上后稳定躺下。",
      "双脚踩稳，肩胛轻微后收下沉，手腕保持中立。",
      "将哑铃推至胸部上方，手肘不要完全锁死。",
      "缓慢下放至胸侧可控制的位置。",
      "呼气推起，保持左右手轨迹稳定。"
    ],
    "commonMistakes": [
      "手腕后折导致前臂不稳。",
      "肩膀前顶或耸肩。",
      "下放过快，失去胸部控制。"
    ],
    "safetyTips": [
      "先用轻重量热身并确认肩部舒适。",
      "肩痛时减少下放幅度或换成器械推胸。",
      "大重量训练时建议有人保护。"
    ],
    "alternativeExerciseIds": [
      "incline_db_bench_press",
      "machine_chest_press"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": true,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肩痛",
      "手腕不适"
    ]
  },
  {
    "id": "lat_pulldown",
    "nameZh": "高位下拉",
    "nameEn": "Lat Pulldown",
    "bodyPart": "back",
    "category": "strength",
    "primaryMuscles": [
      "背阔肌"
    ],
    "secondaryMuscles": [
      "肱二头肌",
      "斜方肌中下束",
      "菱形肌"
    ],
    "movementPattern": "vertical_pull",
    "equipment": [
      "lat_pulldown_machine",
      "cable_machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping",
      "posture"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 8,
        "max": 12
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 90
    },
    "progressionRule": "double_progression",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "调整坐垫和腿垫，让身体稳定。",
      "握住横杆，握距略宽于肩，胸部自然挺起。",
      "先让肩胛下沉，再把横杆拉向上胸。",
      "底部短暂停顿，感受背部收缩。",
      "控制还原，避免肩膀被重量拉起。"
    ],
    "commonMistakes": [
      "身体后仰过多。",
      "主要用手臂猛拉。",
      "把横杆拉到颈后。"
    ],
    "safetyTips": [
      "优先做胸前下拉。",
      "肩颈不适时降低重量。",
      "不要用摆动完成次数。"
    ],
    "alternativeExerciseIds": [
      "straight_arm_pulldown"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": true,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肩痛",
      "颈部不适"
    ]
  },
  {
    "id": "incline_db_bench_press",
    "nameZh": "上斜哑铃卧推",
    "nameEn": "Incline Dumbbell Bench Press",
    "bodyPart": "chest",
    "category": "strength",
    "primaryMuscles": [
      "胸大肌上束"
    ],
    "secondaryMuscles": [
      "肱三头肌",
      "三角肌前束"
    ],
    "movementPattern": "horizontal_push",
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 8,
        "max": 12
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 90
    },
    "progressionRule": "double_progression",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "将训练凳调到低到中等上斜角度。",
      "躺稳后收紧肩胛，哑铃位于上胸两侧。",
      "沿略向内的轨迹推起哑铃。",
      "顶部保持控制，不撞击哑铃。",
      "缓慢下放到肩部舒适的位置。"
    ],
    "commonMistakes": [
      "凳子角度过高，肩前束代偿明显。",
      "下放过深引起肩部不适。",
      "左右哑铃轨迹不一致。"
    ],
    "safetyTips": [
      "肩部敏感时降低凳子角度。",
      "先用轻重量确认动作范围。",
      "保持手腕中立。"
    ],
    "alternativeExerciseIds": [
      "db_bench_press",
      "machine_chest_press"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肩痛"
    ]
  },
  {
    "id": "seated_cable_row",
    "nameZh": "坐姿绳索划船",
    "nameEn": "Seated Cable Row",
    "bodyPart": "back",
    "category": "strength",
    "primaryMuscles": [
      "背阔肌",
      "菱形肌"
    ],
    "secondaryMuscles": [
      "肱二头肌",
      "斜方肌中束",
      "三角肌后束"
    ],
    "movementPattern": "horizontal_pull",
    "equipment": [
      "cable_machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 8,
        "max": 12
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 90
    },
    "progressionRule": "double_progression",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "坐稳并让双脚踩在踏板上。",
      "保持脊柱中立，手臂伸直但肩膀不前耸。",
      "先收肩胛，再把把手拉向下胸或上腹。",
      "短暂停顿后控制还原。",
      "全程保持躯干稳定。"
    ],
    "commonMistakes": [
      "大幅后仰借力。",
      "耸肩拉动。",
      "还原时圆背。"
    ],
    "safetyTips": [
      "选择能保持躯干稳定的重量。",
      "腰部不适时减少重量或使用胸托划船。",
      "不要用突然发力启动动作。"
    ],
    "alternativeExerciseIds": [
      "chest_supported_row"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": true,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "腰痛",
      "肩痛"
    ]
  },
  {
    "id": "db_lateral_raise",
    "nameZh": "哑铃侧平举",
    "nameEn": "Dumbbell Lateral Raise",
    "bodyPart": "shoulder",
    "category": "strength",
    "primaryMuscles": [
      "三角肌中束"
    ],
    "secondaryMuscles": [
      "斜方肌上束",
      "冈上肌"
    ],
    "movementPattern": "shoulder_abduction",
    "equipment": [
      "dumbbell"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 12,
        "max": 20
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "双手持哑铃站立，核心收紧。",
      "肩膀放松，手肘微屈。",
      "向身体两侧抬起哑铃至接近肩高。",
      "短暂停顿后缓慢下放。",
      "保持动作节奏稳定。"
    ],
    "commonMistakes": [
      "身体摆动借力。",
      "耸肩明显。",
      "重量过大导致手腕失控。"
    ],
    "safetyTips": [
      "使用较轻重量并控制离心。",
      "肩痛时降低抬起高度。",
      "避免爆发式甩起。"
    ],
    "alternativeExerciseIds": [
      "face_pull"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肩痛",
      "肩峰撞击不适"
    ]
  },
  {
    "id": "cable_triceps_pushdown",
    "nameZh": "绳索下压",
    "nameEn": "Cable Triceps Pushdown",
    "bodyPart": "arms",
    "category": "strength",
    "primaryMuscles": [
      "肱三头肌"
    ],
    "secondaryMuscles": [
      "前臂肌群"
    ],
    "movementPattern": "elbow_extension",
    "equipment": [
      "cable_machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 10,
        "max": 15
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "站在绳索前，握住直杆或绳柄。",
      "上臂贴近身体两侧，身体微微前倾。",
      "保持手肘位置稳定，将把手向下压。",
      "底部伸直手臂但不要猛烈锁肘。",
      "控制回到起始位置。"
    ],
    "commonMistakes": [
      "肩膀和身体一起下压借力。",
      "手肘前后移动过多。",
      "重量过大导致动作幅度不足。"
    ],
    "safetyTips": [
      "手肘不适时降低重量。",
      "保持手腕自然。",
      "不要在底部用力弹锁关节。"
    ],
    "alternativeExerciseIds": [
      "overhead_triceps_extension"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肘痛",
      "手腕不适"
    ]
  },
  {
    "id": "db_curl",
    "nameZh": "哑铃弯举",
    "nameEn": "Dumbbell Curl",
    "bodyPart": "arms",
    "category": "strength",
    "primaryMuscles": [
      "肱二头肌"
    ],
    "secondaryMuscles": [
      "肱肌",
      "前臂肌群"
    ],
    "movementPattern": "elbow_flexion",
    "equipment": [
      "dumbbell"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 10,
        "max": 15
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "双手持哑铃站立或坐姿，手臂自然下垂。",
      "固定上臂，向上弯举哑铃。",
      "顶部短暂停顿，避免肩膀前移。",
      "缓慢下放至手臂接近伸直。",
      "左右两侧保持同样节奏。"
    ],
    "commonMistakes": [
      "身体后仰甩起重量。",
      "手肘向前抬太多。",
      "离心阶段直接放下。"
    ],
    "safetyTips": [
      "选择能完整控制的重量。",
      "肘部不适时减少活动范围。",
      "不要为了加重牺牲动作稳定。"
    ],
    "alternativeExerciseIds": [
      "incline_db_curl"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肘痛",
      "腕痛"
    ]
  },
  {
    "id": "back_squat",
    "nameZh": "杠铃深蹲",
    "nameEn": "Back Squat",
    "bodyPart": "legs",
    "category": "strength",
    "primaryMuscles": [
      "股四头肌",
      "臀大肌"
    ],
    "secondaryMuscles": [
      "腘绳肌",
      "竖脊肌",
      "核心肌群"
    ],
    "movementPattern": "squat",
    "equipment": [
      "barbell",
      "rack"
    ],
    "difficulty": "intermediate",
    "recommendedFor": [
      "intermediate",
      "advanced"
    ],
    "goals": [
      "muscle_gain",
      "strength",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 5
      },
      "reps": {
        "min": 6,
        "max": 10
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 120
    },
    "progressionRule": "linear_weight",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "将杠铃稳定放在上背部。",
      "出杠后站稳，双脚约与肩同宽。",
      "吸气收紧核心，髋膝同时屈曲下蹲。",
      "下蹲到自己能稳定控制的深度。",
      "脚掌均匀发力站起，膝盖方向跟随脚尖。"
    ],
    "commonMistakes": [
      "膝盖明显内扣。",
      "底部腰背松掉。",
      "脚跟抬起或重心过度前移。"
    ],
    "safetyTips": [
      "使用安全杆或保护架。",
      "先用空杆和轻重量热身。",
      "腰膝疼痛时停止加重并检查动作。"
    ],
    "alternativeExerciseIds": [
      "leg_press"
    ],
    "isBeginnerFriendly": false,
    "isCoreLift": true,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "膝盖不适",
      "腰痛",
      "髋关节活动受限"
    ]
  },
  {
    "id": "leg_press",
    "nameZh": "腿举",
    "nameEn": "Leg Press",
    "bodyPart": "legs",
    "category": "strength",
    "primaryMuscles": [
      "股四头肌"
    ],
    "secondaryMuscles": [
      "臀大肌",
      "腘绳肌"
    ],
    "movementPattern": "squat",
    "equipment": [
      "machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 10,
        "max": 12
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 90
    },
    "progressionRule": "double_progression",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "坐进腿举机，背部和臀部贴稳靠垫。",
      "双脚放在踏板上，约与肩同宽。",
      "解锁后控制踏板下放。",
      "膝盖弯曲到可控制范围后推起。",
      "顶部不要猛烈锁死膝盖。"
    ],
    "commonMistakes": [
      "下放过深导致骨盆卷起。",
      "膝盖内扣。",
      "用手推膝盖借力。"
    ],
    "safetyTips": [
      "确认安全锁位置。",
      "保持臀部贴住靠垫。",
      "膝盖不适时减少深度和重量。"
    ],
    "alternativeExerciseIds": [
      "back_squat"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": true,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "膝痛",
      "腰痛"
    ]
  },
  {
    "id": "leg_extension",
    "nameZh": "腿屈伸",
    "nameEn": "Leg Extension",
    "bodyPart": "legs",
    "category": "strength",
    "primaryMuscles": [
      "股四头肌"
    ],
    "secondaryMuscles": [],
    "movementPattern": "knee_extension",
    "equipment": [
      "machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 2,
        "max": 4
      },
      "reps": {
        "min": 12,
        "max": 15
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "调整靠背和滚垫，使膝关节对齐机器轴心。",
      "坐稳并握住把手。",
      "伸膝抬起滚垫至接近伸直。",
      "顶部短暂停顿，感受股四头肌收缩。",
      "缓慢下放回起始位置。"
    ],
    "commonMistakes": [
      "用惯性踢起重量。",
      "臀部离开坐垫。",
      "重量过大导致膝盖不适。"
    ],
    "safetyTips": [
      "膝盖敏感时缩小幅度并减重。",
      "避免在顶部猛烈锁膝。",
      "先确认机器调节适合身高。"
    ],
    "alternativeExerciseIds": [
      "leg_press"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "膝痛",
      "膝关节术后未恢复"
    ]
  },
  {
    "id": "lying_leg_curl",
    "nameZh": "俯卧腿弯举",
    "nameEn": "Lying Leg Curl",
    "bodyPart": "legs",
    "category": "strength",
    "primaryMuscles": [
      "腘绳肌"
    ],
    "secondaryMuscles": [
      "腓肠肌"
    ],
    "movementPattern": "knee_flexion",
    "equipment": [
      "machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 10,
        "max": 15
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "俯卧在腿弯举机上，膝关节对齐机器轴心。",
      "滚垫位于脚踝上方，髋部贴稳垫面。",
      "弯曲膝盖，将滚垫向臀部方向卷起。",
      "顶部短暂停顿。",
      "缓慢还原，不让重量砸回。"
    ],
    "commonMistakes": [
      "髋部抬离垫面。",
      "用腰部摆动借力。",
      "离心阶段过快。"
    ],
    "safetyTips": [
      "腰部不适时降低重量。",
      "避免膝盖突然完全伸直。",
      "先确认滚垫位置舒适。"
    ],
    "alternativeExerciseIds": [],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "膝痛",
      "腘绳肌拉伤恢复期"
    ]
  },
  {
    "id": "walking_lunge",
    "nameZh": "行走弓步",
    "nameEn": "Walking Lunge",
    "bodyPart": "legs",
    "category": "strength",
    "primaryMuscles": [
      "股四头肌",
      "臀大肌"
    ],
    "secondaryMuscles": [
      "腘绳肌",
      "核心肌群"
    ],
    "movementPattern": "lunge",
    "equipment": [
      "bodyweight",
      "dumbbell"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 2,
        "max": 4
      },
      "reps": {
        "min": 10,
        "max": 12
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 90
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "站直并收紧核心，可徒手或持哑铃。",
      "向前迈一步，身体垂直下沉。",
      "前脚全脚掌发力站起并向前迈下一步。",
      "保持骨盆稳定，膝盖跟随脚尖方向。",
      "两侧交替完成目标次数。"
    ],
    "commonMistakes": [
      "步幅过小导致膝盖压力过大。",
      "身体左右晃动。",
      "后脚用力蹬地过多。"
    ],
    "safetyTips": [
      "先用徒手版本掌握平衡。",
      "膝盖不适时减少深度。",
      "保持训练区域地面平整。"
    ],
    "alternativeExerciseIds": [
      "bulgarian_split_squat"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": true,
    "isBodyweight": false,
    "contraindications": [
      "膝痛",
      "平衡能力不足"
    ]
  },
  {
    "id": "standing_calf_raise",
    "nameZh": "站姿提踵",
    "nameEn": "Standing Calf Raise",
    "bodyPart": "legs",
    "category": "strength",
    "primaryMuscles": [
      "腓肠肌"
    ],
    "secondaryMuscles": [
      "比目鱼肌"
    ],
    "movementPattern": "knee_extension",
    "equipment": [
      "machine",
      "dumbbell"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 12,
        "max": 20
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "站在提踵机或台阶上，前脚掌稳定承重。",
      "保持膝盖自然伸直但不锁死。",
      "脚跟缓慢下放到有拉伸感。",
      "用小腿发力抬起脚跟。",
      "顶部短暂停顿后控制下放。"
    ],
    "commonMistakes": [
      "上下弹动太快。",
      "动作幅度太小。",
      "脚踝向内或向外明显偏移。"
    ],
    "safetyTips": [
      "扶稳器械或固定支撑。",
      "跟腱不适时减少拉伸幅度。",
      "不要用突然反弹完成动作。"
    ],
    "alternativeExerciseIds": [],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "跟腱疼痛",
      "踝关节不适"
    ]
  },
  {
    "id": "seated_db_shoulder_press",
    "nameZh": "坐姿哑铃推肩",
    "nameEn": "Seated Dumbbell Shoulder Press",
    "bodyPart": "shoulder",
    "category": "strength",
    "primaryMuscles": [
      "三角肌前束",
      "三角肌中束"
    ],
    "secondaryMuscles": [
      "肱三头肌",
      "上胸肌"
    ],
    "movementPattern": "vertical_push",
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "difficulty": "intermediate",
    "recommendedFor": [
      "intermediate",
      "advanced"
    ],
    "goals": [
      "muscle_gain",
      "strength",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 6,
        "max": 10
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 120
    },
    "progressionRule": "double_progression",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "坐在有靠背的训练凳上，双脚踩稳。",
      "将哑铃举到肩部两侧，手腕保持中立。",
      "收紧核心，向上推起哑铃。",
      "顶部不要过度耸肩或锁肘。",
      "控制下放回肩部附近。"
    ],
    "commonMistakes": [
      "腰椎过度反弓。",
      "哑铃下放过低引起肩部不适。",
      "左右手不同步。"
    ],
    "safetyTips": [
      "先确认肩部活动范围。",
      "使用靠背帮助稳定躯干。",
      "肩痛时改用更轻重量或机器。"
    ],
    "alternativeExerciseIds": [
      "db_lateral_raise"
    ],
    "isBeginnerFriendly": false,
    "isCoreLift": true,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肩痛",
      "腰痛"
    ]
  },
  {
    "id": "chest_supported_row",
    "nameZh": "胸托划船",
    "nameEn": "Chest Supported Row",
    "bodyPart": "back",
    "category": "strength",
    "primaryMuscles": [
      "背阔肌",
      "菱形肌"
    ],
    "secondaryMuscles": [
      "三角肌后束",
      "肱二头肌",
      "斜方肌中束"
    ],
    "movementPattern": "horizontal_pull",
    "equipment": [
      "dumbbell",
      "bench",
      "machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 8,
        "max": 12
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 90
    },
    "progressionRule": "double_progression",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "趴在上斜凳或胸托器械上，胸部贴稳支撑。",
      "双手握哑铃或把手，手臂自然下垂。",
      "先收肩胛，再将重量拉向身体两侧。",
      "顶部短暂停顿。",
      "控制下放到手臂伸直。"
    ],
    "commonMistakes": [
      "胸部离开支撑借力。",
      "耸肩拉动。",
      "只用手臂弯举重量。"
    ],
    "safetyTips": [
      "调整支撑高度避免压迫胸腹。",
      "选择能完整控制的重量。",
      "肩部不适时缩小幅度。"
    ],
    "alternativeExerciseIds": [
      "seated_cable_row"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": true,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肩痛",
      "胸腹部压迫不适"
    ]
  },
  {
    "id": "machine_chest_press",
    "nameZh": "器械推胸",
    "nameEn": "Machine Chest Press",
    "bodyPart": "chest",
    "category": "strength",
    "primaryMuscles": [
      "胸大肌"
    ],
    "secondaryMuscles": [
      "肱三头肌",
      "三角肌前束"
    ],
    "movementPattern": "horizontal_push",
    "equipment": [
      "machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 10,
        "max": 12
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 90
    },
    "progressionRule": "double_progression",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "调整座椅高度，让把手约在胸部中线。",
      "背部贴稳靠垫，双脚踩稳。",
      "握住把手向前推起。",
      "顶部保持控制，不猛烈锁肘。",
      "缓慢还原到胸部有轻微拉伸的位置。"
    ],
    "commonMistakes": [
      "座椅过高或过低。",
      "肩膀前顶。",
      "重量太大导致幅度变短。"
    ],
    "safetyTips": [
      "先调整机器到舒适位置。",
      "肩痛时减少还原深度。",
      "不要让配重片突然砸落。"
    ],
    "alternativeExerciseIds": [
      "db_bench_press",
      "incline_db_bench_press"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肩痛"
    ]
  },
  {
    "id": "straight_arm_pulldown",
    "nameZh": "直臂下拉",
    "nameEn": "Straight Arm Pulldown",
    "bodyPart": "back",
    "category": "strength",
    "primaryMuscles": [
      "背阔肌"
    ],
    "secondaryMuscles": [
      "大圆肌",
      "肱三头肌长头",
      "核心肌群"
    ],
    "movementPattern": "vertical_pull",
    "equipment": [
      "cable_machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 2,
        "max": 4
      },
      "reps": {
        "min": 12,
        "max": 15
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "站在高位绳索前，双手握住横杆或绳柄。",
      "手臂接近伸直，手肘保持微屈。",
      "胸部微挺，核心收紧。",
      "用背阔肌发力将把手下拉到大腿前。",
      "控制还原到肩部舒适的高度。"
    ],
    "commonMistakes": [
      "把动作做成肱三头下压。",
      "耸肩或圆背。",
      "还原过高导致肩部不适。"
    ],
    "safetyTips": [
      "重量不宜过大。",
      "保持手肘角度基本固定。",
      "肩痛时缩小还原范围。"
    ],
    "alternativeExerciseIds": [
      "lat_pulldown"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肩痛"
    ]
  },
  {
    "id": "face_pull",
    "nameZh": "面拉",
    "nameEn": "Face Pull",
    "bodyPart": "shoulder",
    "category": "strength",
    "primaryMuscles": [
      "三角肌后束",
      "斜方肌中下束"
    ],
    "secondaryMuscles": [
      "菱形肌",
      "肩袖肌群"
    ],
    "movementPattern": "horizontal_pull",
    "equipment": [
      "cable_machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 2,
        "max": 4
      },
      "reps": {
        "min": 12,
        "max": 20
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "将绳索调到面部附近高度。",
      "双手握绳，后退一步保持张力。",
      "拉向面部两侧，手肘向外打开。",
      "末端轻微外旋，肩胛向后收。",
      "缓慢回到起始位置。"
    ],
    "commonMistakes": [
      "重量过大导致身体后仰。",
      "耸肩拉动。",
      "只弯手肘而不控制肩胛。"
    ],
    "safetyTips": [
      "以控制感为主，不追求大重量。",
      "避免拉到眼睛或面部。",
      "肩痛时减少幅度。"
    ],
    "alternativeExerciseIds": [
      "chest_supported_row",
      "db_lateral_raise"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肩痛",
      "颈部不适"
    ]
  },
  {
    "id": "incline_db_curl",
    "nameZh": "上斜哑铃弯举",
    "nameEn": "Incline Dumbbell Curl",
    "bodyPart": "arms",
    "category": "strength",
    "primaryMuscles": [
      "肱二头肌"
    ],
    "secondaryMuscles": [
      "肱肌",
      "前臂肌群"
    ],
    "movementPattern": "elbow_flexion",
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 10,
        "max": 15
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "将训练凳调成上斜，背部贴稳。",
      "双手持哑铃自然下垂。",
      "固定上臂，向上弯举。",
      "顶部短暂停顿，不让肩膀前移。",
      "缓慢下放至手臂接近伸直。"
    ],
    "commonMistakes": [
      "下放时手臂完全松掉。",
      "肩膀向前带动哑铃。",
      "用过大重量缩短幅度。"
    ],
    "safetyTips": [
      "从较轻重量开始。",
      "肩前侧不适时调高凳子角度。",
      "肘部不适时减少底部拉伸。"
    ],
    "alternativeExerciseIds": [
      "db_curl"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肘痛",
      "肩痛"
    ]
  },
  {
    "id": "overhead_triceps_extension",
    "nameZh": "过顶肱三头肌伸展",
    "nameEn": "Overhead Triceps Extension",
    "bodyPart": "arms",
    "category": "strength",
    "primaryMuscles": [
      "肱三头肌长头"
    ],
    "secondaryMuscles": [
      "肱三头肌外侧头",
      "核心肌群"
    ],
    "movementPattern": "elbow_extension",
    "equipment": [
      "dumbbell",
      "cable_machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 10,
        "max": 15
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "坐姿或站姿，将哑铃或绳索置于头后。",
      "上臂尽量保持靠近头部。",
      "弯曲手肘让重量下放到舒适位置。",
      "伸肘将重量推回头顶。",
      "全程保持核心稳定。"
    ],
    "commonMistakes": [
      "腰部过度反弓。",
      "手肘向两侧打开太多。",
      "下放过深引起肘肩不适。"
    ],
    "safetyTips": [
      "肩部活动受限时使用绳索版本。",
      "不要追求过深下放。",
      "肘痛时降低重量或更换下压。"
    ],
    "alternativeExerciseIds": [
      "cable_triceps_pushdown"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "肘痛",
      "肩痛"
    ]
  },
  {
    "id": "romanian_deadlift",
    "nameZh": "罗马尼亚硬拉",
    "nameEn": "Romanian Deadlift",
    "bodyPart": "glutes",
    "category": "strength",
    "primaryMuscles": [
      "腘绳肌",
      "臀大肌"
    ],
    "secondaryMuscles": [
      "竖脊肌",
      "前臂",
      "核心肌群"
    ],
    "movementPattern": "hinge",
    "equipment": [
      "barbell",
      "dumbbell"
    ],
    "difficulty": "intermediate",
    "recommendedFor": [
      "intermediate",
      "advanced"
    ],
    "goals": [
      "muscle_gain",
      "strength",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 6,
        "max": 10
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 120
    },
    "progressionRule": "double_progression",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "双脚约与髋同宽站立，双手握杠铃或哑铃。",
      "膝盖微屈，核心收紧，背部保持中立。",
      "向后推髋，让重量贴近大腿下放。",
      "下放到腘绳肌有拉伸且背部稳定的位置。",
      "臀腿发力伸髋站起，顶部不要过度后仰。"
    ],
    "commonMistakes": [
      "膝盖弯曲太多，把动作做成深蹲。",
      "下放时弓背。",
      "重量离身体太远。"
    ],
    "safetyTips": [
      "先掌握髋铰链模式。",
      "全程让重量靠近身体。",
      "腰部不适时减少幅度或降低重量。"
    ],
    "alternativeExerciseIds": [
      "hip_thrust"
    ],
    "isBeginnerFriendly": false,
    "isCoreLift": true,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "腰痛",
      "腘绳肌拉伤恢复期"
    ]
  },
  {
    "id": "hip_thrust",
    "nameZh": "臀推",
    "nameEn": "Hip Thrust",
    "bodyPart": "glutes",
    "category": "strength",
    "primaryMuscles": [
      "臀大肌"
    ],
    "secondaryMuscles": [
      "腘绳肌",
      "股四头肌",
      "核心肌群"
    ],
    "movementPattern": "hip_thrust",
    "equipment": [
      "barbell",
      "bench",
      "machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 8,
        "max": 12
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 90
    },
    "progressionRule": "double_progression",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "上背靠在训练凳边缘，杠铃或垫子放在髋部。",
      "双脚踩稳，膝盖弯曲。",
      "收紧核心并轻微骨盆后倾。",
      "用臀部发力将髋部推起到躯干接近水平。",
      "顶部短暂停顿后控制下放。"
    ],
    "commonMistakes": [
      "腰部过度反弓代替伸髋。",
      "脚离身体太远或太近。",
      "顶部只追求高度而失去臀部收缩。"
    ],
    "safetyTips": [
      "使用护垫减少髋部压迫。",
      "先用轻重量确认脚位。",
      "腰痛时减少重量并检查骨盆位置。"
    ],
    "alternativeExerciseIds": [
      "romanian_deadlift"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": true,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "腰痛",
      "髋部不适"
    ]
  },
  {
    "id": "bulgarian_split_squat",
    "nameZh": "保加利亚分腿蹲",
    "nameEn": "Bulgarian Split Squat",
    "bodyPart": "legs",
    "category": "strength",
    "primaryMuscles": [
      "股四头肌",
      "臀大肌"
    ],
    "secondaryMuscles": [
      "腘绳肌",
      "核心肌群"
    ],
    "movementPattern": "lunge",
    "equipment": [
      "bodyweight",
      "dumbbell",
      "bench"
    ],
    "difficulty": "intermediate",
    "recommendedFor": [
      "intermediate",
      "advanced"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 3,
        "max": 4
      },
      "reps": {
        "min": 8,
        "max": 12
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 90
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "背对训练凳站立，将后脚放在凳上。",
      "前脚站到能稳定下蹲的位置。",
      "收紧核心，身体垂直或略前倾下沉。",
      "前脚发力站起。",
      "完成一侧后再换另一侧。"
    ],
    "commonMistakes": [
      "前脚距离不合适导致膝盖或髋部不适。",
      "身体左右晃动。",
      "后脚用力过多。"
    ],
    "safetyTips": [
      "先徒手练习平衡。",
      "膝盖不适时减少深度。",
      "使用稳定高度的训练凳。"
    ],
    "alternativeExerciseIds": [
      "walking_lunge"
    ],
    "isBeginnerFriendly": false,
    "isCoreLift": false,
    "isUnilateral": true,
    "isBodyweight": false,
    "contraindications": [
      "膝痛",
      "平衡能力不足"
    ]
  },
  {
    "id": "cable_crunch",
    "nameZh": "绳索卷腹",
    "nameEn": "Cable Crunch",
    "bodyPart": "core",
    "category": "strength",
    "primaryMuscles": [
      "腹直肌"
    ],
    "secondaryMuscles": [
      "腹斜肌"
    ],
    "movementPattern": "core_flexion",
    "equipment": [
      "cable_machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 2,
        "max": 4
      },
      "reps": {
        "min": 10,
        "max": 15
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "weight_reps",
    "steps": [
      "跪在高位绳索前，双手握住绳柄靠近头部。",
      "固定髋部位置，轻微收下巴。",
      "用腹部发力让胸骨向骨盆靠近。",
      "底部短暂停顿。",
      "控制回到起始位置，不要完全放松。"
    ],
    "commonMistakes": [
      "用手臂下拉绳索。",
      "髋部大幅前后移动。",
      "腰部过度伸展还原。"
    ],
    "safetyTips": [
      "重量不宜过大。",
      "腰部不适时改用自重核心动作。",
      "保持动作来自脊柱屈曲而非手臂拉动。"
    ],
    "alternativeExerciseIds": [
      "reverse_crunch"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "腰痛",
      "颈部不适"
    ]
  },
  {
    "id": "zone2_cardio",
    "nameZh": "二区有氧",
    "nameEn": "Zone 2 Cardio",
    "bodyPart": "cardio",
    "category": "cardio",
    "primaryMuscles": [
      "心肺系统"
    ],
    "secondaryMuscles": [
      "下肢肌群"
    ],
    "movementPattern": "cardio",
    "equipment": [
      "bodyweight",
      "machine"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "fat_loss",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 1,
        "max": 1
      },
      "reps": null,
      "durationSeconds": {
        "min": 1200,
        "max": 1800
      },
      "distanceKm": null,
      "restSeconds": 0
    },
    "progressionRule": "time_first",
    "intensity": {
      "rir": null,
      "rpe": 5
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "time_based",
    "steps": [
      "选择步行、椭圆机、自行车或划船机等低冲击方式。",
      "用轻到中等强度开始 3-5 分钟。",
      "保持能说短句但不能轻松唱歌的强度。",
      "维持目标时间，呼吸保持可控。",
      "结束后逐渐降低速度。"
    ],
    "commonMistakes": [
      "强度做得过高变成间歇训练。",
      "一开始速度太快。",
      "忽略热身和冷身。"
    ],
    "safetyTips": [
      "有胸闷、头晕或异常不适应停止。",
      "选择关节舒适的器械或方式。",
      "从较短时间逐步增加。"
    ],
    "alternativeExerciseIds": [],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": false,
    "contraindications": [
      "急性不适",
      "医生建议限制有氧运动"
    ]
  },
  {
    "id": "plank",
    "nameZh": "平板支撑",
    "nameEn": "Plank",
    "bodyPart": "core",
    "category": "mobility",
    "primaryMuscles": [
      "腹横肌",
      "腹直肌"
    ],
    "secondaryMuscles": [
      "臀大肌",
      "肩胛稳定肌"
    ],
    "movementPattern": "core_anti_extension",
    "equipment": [
      "bodyweight"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 2,
        "max": 4
      },
      "reps": null,
      "durationSeconds": {
        "min": 30,
        "max": 60
      },
      "distanceKm": null,
      "restSeconds": 60
    },
    "progressionRule": "time_first",
    "intensity": {
      "rir": null,
      "rpe": 7
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "time_based",
    "steps": [
      "前臂撑地，手肘位于肩膀下方。",
      "双脚向后伸直，身体形成一条直线。",
      "轻微收紧臀部和腹部，避免塌腰。",
      "保持自然呼吸。",
      "到达目标时间后缓慢放下。"
    ],
    "commonMistakes": [
      "腰部下塌。",
      "臀部抬得过高。",
      "憋气。"
    ],
    "safetyTips": [
      "腰部不适时缩短时间或改为跪姿。",
      "保持颈部自然，不抬头。",
      "质量下降时停止该组。"
    ],
    "alternativeExerciseIds": [
      "dead_bug"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": true,
    "contraindications": [
      "腰痛",
      "肩痛"
    ]
  },
  {
    "id": "dead_bug",
    "nameZh": "死虫",
    "nameEn": "Dead Bug",
    "bodyPart": "core",
    "category": "strength",
    "primaryMuscles": [
      "腹横肌",
      "腹直肌"
    ],
    "secondaryMuscles": [
      "髋屈肌",
      "肩胛稳定肌"
    ],
    "movementPattern": "core_anti_extension",
    "equipment": [
      "bodyweight"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 2,
        "max": 4
      },
      "reps": {
        "min": 10,
        "max": 12
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 45
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "reps_only",
    "steps": [
      "仰卧，双臂伸向天花板，髋膝弯曲约 90 度。",
      "轻轻让下背贴近地面，收紧腹部。",
      "缓慢伸出一侧腿和对侧手臂。",
      "保持腰椎稳定后回到起始位置。",
      "左右交替完成。"
    ],
    "commonMistakes": [
      "伸腿时腰部拱起。",
      "动作速度过快。",
      "肩颈紧张。"
    ],
    "safetyTips": [
      "先缩短伸腿距离。",
      "腰部不适时只移动腿或手。",
      "保持呼吸，不要憋气。"
    ],
    "alternativeExerciseIds": [
      "plank"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": true,
    "contraindications": [
      "腰痛"
    ]
  },
  {
    "id": "reverse_crunch",
    "nameZh": "反向卷腹",
    "nameEn": "Reverse Crunch",
    "bodyPart": "core",
    "category": "strength",
    "primaryMuscles": [
      "腹直肌"
    ],
    "secondaryMuscles": [
      "腹斜肌",
      "髋屈肌"
    ],
    "movementPattern": "core_flexion",
    "equipment": [
      "bodyweight"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "muscle_gain",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 2,
        "max": 4
      },
      "reps": {
        "min": 12,
        "max": 15
      },
      "durationSeconds": null,
      "distanceKm": null,
      "restSeconds": 45
    },
    "progressionRule": "reps_first",
    "intensity": {
      "rir": 2,
      "rpe": 8
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "reps_only",
    "steps": [
      "仰卧，双手放在身体两侧或扶住固定支撑。",
      "屈膝抬腿，让大腿接近垂直地面。",
      "用腹部带动骨盆轻微后倾并抬离地面。",
      "顶部短暂停顿。",
      "缓慢放下骨盆，保持控制。"
    ],
    "commonMistakes": [
      "用腿大幅摆动借力。",
      "抬得过高导致腰部失控。",
      "下放时直接砸回地面。"
    ],
    "safetyTips": [
      "腰部敏感时缩小动作幅度。",
      "保持颈部放松。",
      "不要追求快速次数。"
    ],
    "alternativeExerciseIds": [
      "cable_crunch"
    ],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": true,
    "contraindications": [
      "腰痛",
      "颈部不适"
    ]
  },
  {
    "id": "mobility_routine",
    "nameZh": "活动度组合",
    "nameEn": "Mobility Routine",
    "bodyPart": "mobility",
    "category": "mobility",
    "primaryMuscles": [
      "髋部",
      "踝关节",
      "胸椎",
      "肩部"
    ],
    "secondaryMuscles": [],
    "movementPattern": "mobility",
    "equipment": [
      "bodyweight"
    ],
    "difficulty": "beginner",
    "recommendedFor": [
      "beginner",
      "intermediate"
    ],
    "goals": [
      "posture",
      "body_shaping"
    ],
    "recommendation": {
      "sets": {
        "min": 1,
        "max": 1
      },
      "reps": null,
      "durationSeconds": {
        "min": 480,
        "max": 600
      },
      "distanceKm": null,
      "restSeconds": 0
    },
    "progressionRule": "time_first",
    "intensity": {
      "rir": null,
      "rpe": 3
    },
    "media": {
      "imageUrl": "",
      "videoUrl": "",
      "thumbnailUrl": ""
    },
    "sourceRefs": [
      {
        "name": "待核验权威动作来源",
        "url": "",
        "type": "exercise_instruction",
        "note": "后续由人工结合 ACE、NASM、ACSM 等来源核验。"
      }
    ],
    "trackingType": "time_based",
    "steps": [
      "用轻松节奏完成髋屈肌动态拉伸。",
      "进行踝关节前移活动。",
      "完成胸椎旋转或开书式动作。",
      "加入肩部绕环或墙滑。",
      "每个动作保持可控范围，不追求疼痛感。"
    ],
    "commonMistakes": [
      "把活动度做成高强度拉扯。",
      "动作速度过快。",
      "忽略左右差异。"
    ],
    "safetyTips": [
      "只在无痛范围内活动。",
      "呼吸保持放松。",
      "急性疼痛或损伤期先暂停相关动作。"
    ],
    "alternativeExerciseIds": [],
    "isBeginnerFriendly": true,
    "isCoreLift": false,
    "isUnilateral": false,
    "isBodyweight": true,
    "contraindications": [
      "急性关节疼痛",
      "近期损伤未恢复"
    ]
  }
];

export function getExerciseById(exerciseId) {
  return exercises.find((exercise) => exercise.id === exerciseId) || null;
}

export function getAlternativeExercises(exerciseId) {
  const exercise = getExerciseById(exerciseId);

  if (!exercise) {
    return [];
  }

  return exercise.alternativeExerciseIds
    .map((id) => getExerciseById(id))
    .filter(Boolean);
}

export function validateExerciseLibrary(exerciseList) {
  const safeExercises = Array.isArray(exerciseList) ? exerciseList : [];
  const ids = safeExercises.map((exercise) => exercise.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const enumValues = {
    movementPattern: Object.keys(MOVEMENT_PATTERNS),
    bodyPart: Object.keys(BODY_PARTS),
    category: Object.keys(CATEGORIES),
    difficulty: Object.keys(DIFFICULTY),
    trackingType: Object.keys(TRACKING_TYPES)
  };
  const missingFields = safeExercises.flatMap((exercise) =>
    REQUIRED_EXERCISE_FIELDS
      .filter((field) => !(field in exercise))
      .map((field) => ({ exerciseId: exercise.id, field }))
  );
  const brokenAlternativeIds = safeExercises.flatMap((exercise) =>
    (Array.isArray(exercise.alternativeExerciseIds) ? exercise.alternativeExerciseIds : [])
      .filter((alternativeId) => !ids.includes(alternativeId))
      .map((alternativeId) => ({ exerciseId: exercise.id, alternativeId }))
  );
  const alternativeMismatchWarnings = safeExercises.flatMap((exercise) =>
    (Array.isArray(exercise.alternativeExerciseIds) ? exercise.alternativeExerciseIds : [])
      .map((alternativeId) => ({
        exercise,
        alternativeId,
        alternative: safeExercises.find((item) => item.id === alternativeId) || null
      }))
      .filter(({ exercise, alternative }) =>
        alternative &&
        alternative.bodyPart !== exercise.bodyPart &&
        alternative.movementPattern !== exercise.movementPattern
      )
      .map(({ exercise, alternativeId }) => ({ exerciseId: exercise.id, alternativeId }))
  );
  const invalidEnums = safeExercises.flatMap((exercise) =>
    Object.keys(enumValues)
      .filter((field) => !enumValues[field].includes(exercise[field]))
      .map((field) => ({ exerciseId: exercise.id, field, value: exercise[field] }))
  );
  const timeBasedRecommendationErrors = safeExercises
    .filter((exercise) =>
      exercise.trackingType === 'time_based' &&
      !hasRecommendationValue(exercise.recommendation, 'durationSeconds')
    )
    .map((exercise) => ({ exerciseId: exercise.id, field: 'recommendation.durationSeconds' }));
  const distanceTimeRecommendationErrors = safeExercises
    .filter((exercise) =>
      exercise.trackingType === 'distance_time' &&
      !hasRecommendationValue(exercise.recommendation, 'durationSeconds') &&
      !hasRecommendationValue(exercise.recommendation, 'distanceKm')
    )
    .map((exercise) => ({ exerciseId: exercise.id, field: 'recommendation.durationSeconds|distanceKm' }));
  const coreLiftRequiredFieldErrors = safeExercises
    .filter((exercise) => exercise.isCoreLift === true && (!exercise.progressionRule || !exercise.trackingType))
    .map((exercise) => ({
      exerciseId: exercise.id,
      missing: ['progressionRule', 'trackingType'].filter((field) => !exercise[field])
    }));

  const errors = {
    duplicateIds,
    missingFields,
    brokenAlternativeIds,
    invalidEnums,
    timeBasedRecommendationErrors,
    distanceTimeRecommendationErrors,
    coreLiftRequiredFieldErrors
  };
  const warnings = {
    alternativeMismatchWarnings
  };
  const errorCount = Object.keys(errors).reduce((count, key) => count + errors[key].length, 0);

  return {
    isValid: errorCount === 0,
    errors,
    warnings
  };
}
