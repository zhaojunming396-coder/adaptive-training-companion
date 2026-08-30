export const bodyRecomposition4DayPlan = {
  planId: 'plan_4_day_upper_lower_recomposition_v1_2',
  nameZh: '一周 4 练身体重组计划',
  nameEn: '4-Day Upper Lower Body Recomposition Plan',
  goal: ['muscle_gain', 'body_recomposition', 'fat_loss_support'],
  level: 'intermediate',
  durationWeeks: 8,
  weeklyFrequency: 4,
  cardioFrequency: 2,
  suitableFor: '有 1-3 年训练经验、体重约 65kg、想增肌并略微降低体脂的人。',
  notSuitableFor: '完全新手、伤病恢复期、无法保证每周 4 次训练的人。',
  weeklySchedule: [
    { dayIndex: 1, planDayId: 'day_1_upper_a', label: 'Day 1', nameZh: '上肢 A：胸背主导' },
    { dayIndex: 2, planDayId: 'day_2_lower_a', label: 'Day 2', nameZh: '下肢 A：股四头主导' },
    { dayIndex: 3, planDayId: null, label: 'Day 3', nameZh: '休息 / 低强度有氧' },
    { dayIndex: 4, planDayId: 'day_4_upper_b', label: 'Day 4', nameZh: '上肢 B：肩背手臂主导' },
    { dayIndex: 5, planDayId: 'day_5_lower_b', label: 'Day 5', nameZh: '下肢 B：臀腿后侧主导' },
    { dayIndex: 6, planDayId: 'day_6_cardio_core', label: 'Day 6', nameZh: '有氧 + 核心' },
    { dayIndex: 7, planDayId: null, label: 'Day 7', nameZh: '休息' }
  ],
  trainingBlocks: [
    {
      blockId: 'week_1_4_volume_accumulation',
      nameZh: '训练量累积期',
      type: 'volume_accumulation',
      startWeek: 1,
      endWeek: 4,
      notes: '逐步稳定动作质量和训练容量，优先把目标次数区间做满。'
    },
    {
      blockId: 'week_5_deload',
      nameZh: '减量恢复周',
      type: 'deload',
      startWeek: 5,
      endWeek: 5,
      notes: '降低总训练量和主观强度，恢复关节、肌肉和中枢疲劳。'
    },
    {
      blockId: 'week_6_8_intensity_progression',
      nameZh: '强度提升期',
      type: 'intensity_progression',
      startWeek: 6,
      endWeek: 8,
      notes: '在动作稳定前提下提升重量或完成更高质量的目标次数。'
    }
  ],
  planDays: [
    {
      planDayId: 'day_1_upper_a',
      nameZh: '上肢 A：胸背主导',
      focus: 'upper_body_chest_back',
      estimatedDurationMinutes: 75,
      warmup: {
        durationMinutes: 10,
        items: [
          '5 分钟轻度划船机或椭圆机',
          '肩胛后收下沉激活 2 组',
          '哑铃卧推和高位下拉分别做 2-3 组递增热身'
        ]
      },
      exercises: [
        {
          exerciseId: 'db_bench_press',
          target: {
            sets: 4,
            reps: '8-12',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 90,
            rir: 2,
            tempo: '3-0-1-0',
            note: '胸部主项，所有组达到 12 次且 RIR 达标后加重量。'
          }
        },
        {
          exerciseId: 'lat_pulldown',
          target: {
            sets: 4,
            reps: '8-12',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 90,
            rir: 2,
            tempo: '2-1-2-0',
            note: '背部主项，先沉肩再下拉。'
          }
        },
        {
          exerciseId: 'incline_db_bench_press',
          target: {
            sets: 3,
            reps: '8-12',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 90,
            rir: 2,
            tempo: '3-0-1-0',
            note: '上胸补充，避免肩前束代偿过多。'
          }
        },
        {
          exerciseId: 'seated_cable_row',
          target: {
            sets: 3,
            reps: '8-12',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 90,
            rir: 2,
            tempo: '2-1-2-0',
            note: '水平拉，平衡卧推动作量。'
          }
        },
        {
          exerciseId: 'db_lateral_raise',
          target: {
            sets: 4,
            reps: '12-20',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-1-2-0',
            note: '孤立动作，优先增加次数。'
          }
        },
        {
          exerciseId: 'cable_triceps_pushdown',
          target: {
            sets: 3,
            reps: '10-15',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-0-2-0',
            note: '手肘固定，避免借力下压。'
          }
        },
        {
          exerciseId: 'db_curl',
          target: {
            sets: 3,
            reps: '10-15',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-0-2-0',
            note: '肱二头肌补充，控制离心。'
          }
        }
      ],
      cardioAfterWorkout: {
        enabled: false,
        type: '',
        durationMinutes: 0,
        intensity: '',
        note: ''
      },
      notes: '胸背主导日，优先保证前两个复合动作表现。'
    },
    {
      planDayId: 'day_2_lower_a',
      nameZh: '下肢 A：股四头主导',
      focus: 'lower_body_quad',
      estimatedDurationMinutes: 75,
      warmup: {
        durationMinutes: 12,
        items: [
          '5 分钟自行车',
          '髋、踝、膝动态热身',
          '深蹲或腿举做 3 组递增热身'
        ]
      },
      exercises: [
        {
          exerciseId: 'back_squat',
          target: {
            sets: 4,
            reps: '6-10',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 120,
            rir: 2,
            tempo: '3-0-1-0',
            note: '可按状态替换为 leg_press。'
          }
        },
        {
          exerciseId: 'leg_press',
          target: {
            sets: 3,
            reps: '10-12',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 90,
            rir: 2,
            tempo: '3-0-1-0',
            note: '股四头补量，控制下放。'
          }
        },
        {
          exerciseId: 'leg_extension',
          target: {
            sets: 3,
            reps: '12-15',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-1-2-0',
            note: '顶峰收缩 1 秒。'
          }
        },
        {
          exerciseId: 'lying_leg_curl',
          target: {
            sets: 3,
            reps: '10-15',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-1-2-0',
            note: '给后侧链保留基础训练量。'
          }
        },
        {
          exerciseId: 'walking_lunge',
          target: {
            sets: 3,
            reps: '10-12/侧',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 90,
            rir: 2,
            tempo: '2-0-1-0',
            note: '保持骨盆稳定。'
          }
        },
        {
          exerciseId: 'standing_calf_raise',
          target: {
            sets: 4,
            reps: '12-20',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-1-2-1',
            note: '全程控制，底部充分拉伸。'
          }
        }
      ],
      cardioAfterWorkout: {
        enabled: false,
        type: '',
        durationMinutes: 0,
        intensity: '',
        note: ''
      },
      notes: '股四头主导日，避免在主项前安排高强度有氧。'
    },
    {
      planDayId: 'day_4_upper_b',
      nameZh: '上肢 B：肩背手臂主导',
      focus: 'upper_body_shoulder_back_arms',
      estimatedDurationMinutes: 75,
      warmup: {
        durationMinutes: 10,
        items: [
          '5 分钟轻度有氧',
          '肩袖外旋和肩胛上旋激活',
          '肩推动作做 2-3 组递增热身'
        ]
      },
      exercises: [
        {
          exerciseId: 'seated_db_shoulder_press',
          target: {
            sets: 4,
            reps: '6-10',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 120,
            rir: 2,
            tempo: '2-0-1-0',
            note: '肩部主项，保持核心稳定。'
          }
        },
        {
          exerciseId: 'chest_supported_row',
          target: {
            sets: 4,
            reps: '8-12',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 90,
            rir: 2,
            tempo: '2-1-2-0',
            note: '可替换为 barbell_row。'
          }
        },
        {
          exerciseId: 'machine_chest_press',
          target: {
            sets: 3,
            reps: '10-12',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 90,
            rir: 2,
            tempo: '3-0-1-0',
            note: '胸部容量补充。'
          }
        },
        {
          exerciseId: 'straight_arm_pulldown',
          target: {
            sets: 3,
            reps: '12-15',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-1-2-0',
            note: '背阔肌孤立，手臂尽量固定。'
          }
        },
        {
          exerciseId: 'face_pull',
          target: {
            sets: 3,
            reps: '12-20',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-1-2-0',
            note: '后束和肩胛稳定。'
          }
        },
        {
          exerciseId: 'incline_db_curl',
          target: {
            sets: 3,
            reps: '10-15',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-0-2-0',
            note: '肱二头肌，控制离心。'
          }
        },
        {
          exerciseId: 'overhead_triceps_extension',
          target: {
            sets: 3,
            reps: '10-15',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-0-2-0',
            note: '肱三头肌长头。'
          }
        }
      ],
      cardioAfterWorkout: {
        enabled: false,
        type: '',
        durationMinutes: 0,
        intensity: '',
        note: ''
      },
      notes: '肩背手臂容量日，不追求力竭重量。'
    },
    {
      planDayId: 'day_5_lower_b',
      nameZh: '下肢 B：臀腿后侧主导',
      focus: 'lower_body_posterior_chain',
      estimatedDurationMinutes: 80,
      warmup: {
        durationMinutes: 12,
        items: [
          '5 分钟自行车',
          '髋铰链模式练习',
          '罗马尼亚硬拉做 3 组递增热身'
        ]
      },
      exercises: [
        {
          exerciseId: 'romanian_deadlift',
          target: {
            sets: 4,
            reps: '6-10',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 120,
            rir: 2,
            tempo: '3-1-1-0',
            note: '后侧链主项，重量贴近身体。'
          }
        },
        {
          exerciseId: 'hip_thrust',
          target: {
            sets: 4,
            reps: '8-12',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 90,
            rir: 2,
            tempo: '2-1-1-0',
            note: '臀部主项，顶峰收缩。'
          }
        },
        {
          exerciseId: 'lying_leg_curl',
          target: {
            sets: 3,
            reps: '10-15',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-1-2-0',
            note: '腘绳肌屈膝功能。'
          }
        },
        {
          exerciseId: 'bulgarian_split_squat',
          target: {
            sets: 3,
            reps: '8-12/侧',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 90,
            rir: 2,
            tempo: '3-0-1-0',
            note: '单侧臀腿补充。'
          }
        },
        {
          exerciseId: 'leg_extension',
          target: {
            sets: 2,
            reps: '12-15',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: 2,
            tempo: '2-1-2-0',
            note: '少量股四头维持量。'
          }
        },
        {
          exerciseId: 'standing_calf_raise',
          target: {
            sets: 4,
            reps: '12-20',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-1-2-1',
            note: '小腿训练。'
          }
        },
        {
          exerciseId: 'cable_crunch',
          target: {
            sets: 3,
            reps: '10-15',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 60,
            rir: '1-2',
            tempo: '2-1-2-0',
            note: '可替换为 hanging_leg_raise。'
          }
        }
      ],
      cardioAfterWorkout: {
        enabled: false,
        type: '',
        durationMinutes: 0,
        intensity: '',
        note: ''
      },
      notes: '臀腿后侧主导日，优先保证髋铰链动作质量。'
    },
    {
      planDayId: 'day_6_cardio_core',
      nameZh: '有氧 + 核心',
      focus: 'cardio_core',
      estimatedDurationMinutes: 50,
      warmup: {
        durationMinutes: 8,
        items: [
          '轻松步行或自行车 5 分钟',
          '动态拉伸 3 分钟'
        ]
      },
      exercises: [
        {
          exerciseId: 'zone2_cardio',
          target: {
            sets: 1,
            reps: null,
            durationSeconds: null,
            durationMinutes: '20-30',
            restSeconds: 0,
            rir: null,
            tempo: '',
            note: '低到中等强度，能说短句但不能轻松唱歌。'
          }
        },
        {
          exerciseId: 'plank',
          target: {
            sets: 3,
            reps: null,
            durationSeconds: '30-60',
            durationMinutes: null,
            restSeconds: 60,
            rir: null,
            tempo: '',
            note: '保持骨盆中立，不塌腰。'
          }
        },
        {
          exerciseId: 'dead_bug',
          target: {
            sets: 3,
            reps: '10-12/侧',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 45,
            rir: 2,
            tempo: '2-1-2-0',
            note: '腰椎稳定，不塌腰。'
          }
        },
        {
          exerciseId: 'reverse_crunch',
          target: {
            sets: 3,
            reps: '12-15',
            durationSeconds: null,
            durationMinutes: null,
            restSeconds: 45,
            rir: '1-2',
            tempo: '2-1-2-0',
            note: '控制骨盆后倾。'
          }
        },
        {
          exerciseId: 'mobility_routine',
          target: {
            sets: 1,
            reps: null,
            durationSeconds: null,
            durationMinutes: '8-10',
            restSeconds: 0,
            rir: null,
            tempo: '',
            note: '髋、踝、胸椎和肩部活动度。'
          }
        }
      ],
      cardioAfterWorkout: {
        enabled: false,
        type: '',
        durationMinutes: 0,
        intensity: '',
        note: ''
      },
      notes: '恢复导向，避免做成高强度间歇。'
    }
  ],
  progressionStrategy: {
    type: 'structured_progression',
    rules: [
      {
        ruleId: 'compound_double_progression',
        appliesTo: ['compound_lift'],
        description: '复合动作达到所有组目标次数上限且 RIR 达标时，下次加重量。',
        action: 'increase_weight_next_session'
      },
      {
        ruleId: 'isolation_reps_first',
        appliesTo: ['isolation_lift'],
        description: '孤立动作优先增加次数，达到次数上限后再小幅加重量。',
        action: 'increase_reps_then_small_weight'
      },
      {
        ruleId: 'cardio_time_first',
        appliesTo: ['cardio'],
        description: '有氧动作优先增加时间，再增加强度。',
        action: 'increase_duration_then_intensity'
      },
      {
        ruleId: 'performance_drop_adjustment',
        appliesTo: ['all'],
        description: '如果连续两次训练表现下降，提示降低训练量或增加休息。',
        action: 'reduce_volume_or_add_rest'
      }
    ]
  },
  deloadStrategy: {
    week: 5,
    rules: [
      {
        ruleId: 'reduce_volume',
        description: '第 5 周总训练组数减少 30%-40%。',
        action: 'reduce_sets_by_30_to_40_percent'
      },
      {
        ruleId: 'reduce_compound_sets',
        description: '复合动作减少 1-2 组。',
        action: 'reduce_compound_lift_sets_by_1_to_2'
      },
      {
        ruleId: 'increase_rir',
        description: '所有动作 RIR 提高到 3-4。',
        action: 'set_target_rir_to_3_to_4'
      },
      {
        ruleId: 'avoid_failure',
        description: '不追求加重量，不做力竭组。',
        action: 'avoid_load_progression_and_failure_sets'
      }
    ]
  },
  notes: '计划面向有 1-3 年训练经验、体重约 65kg、目标为增肌并让体脂率略微下降的人。饮食建议接近维持热量或轻微热量盈余，并保证蛋白质摄入。'
};
