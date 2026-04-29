'use client'

import { useMemo, useRef, useState } from 'react'
import {
  AlignmentSigns,
  ProGrowthInput,
  PubertySigns,
  predictGrowthPro,
} from '@/lib/growth-prediction-pro'
import { Sex } from '@/lib/growth-prediction'

type PostureType = NonNullable<AlignmentSigns['postureType']>
type PelvicTilt = NonNullable<AlignmentSigns['pelvicTilt']>
type LegAlignment = NonNullable<AlignmentSigns['legAlignment']>
type Rotation = NonNullable<AlignmentSigns['pelvicRotation']>
type TrunkRotRestriction = NonNullable<AlignmentSigns['trunkRotationRestriction']>
type Side = 'none' | 'left' | 'right'
type SquatKneeIn = NonNullable<AlignmentSigns['squatKneeIn']>

export default function TrainerGrowthForm() {
  // 基本
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState<string>('') // YYYY-MM-DD
  const [sex, setSex] = useState<Sex>('male')
  const [measuredAt, setMeasuredAt] = useState<string>(
    new Date().toISOString().slice(0, 10)
  )

  // 身体測定
  const [heightCm, setHeightCm] = useState<number | ''>(155)
  const [weightKg, setWeightKg] = useState<number | ''>(45)
  const [sittingHeightCm, setSittingHeightCm] = useState<number | ''>('')
  const [bodyFatPercent, setBodyFatPercent] = useState<number | ''>('')
  const [skeletalMuscleKg, setSkeletalMuscleKg] = useState<number | ''>('')
  const [shoeSizeCm, setShoeSizeCm] = useState<number | ''>('')

  // 家族
  const [fatherHeightCm, setFatherHeightCm] = useState<number | ''>('')
  const [motherHeightCm, setMotherHeightCm] = useState<number | ''>('')
  const [siblingsRaw, setSiblingsRaw] = useState<string>('')

  // 思春期
  const [voiceChange, setVoiceChange] = useState(false)
  const [bodyHair, setBodyHair] = useState(false)
  const [appetiteSurge, setAppetiteSurge] = useState(false)
  const [shoeSizeJump, setShoeSizeJump] = useState(false)
  const [menarche, setMenarche] = useState(false)
  const [menarcheMonthsAgo, setMenarcheMonthsAgo] = useState<number | ''>('')

  // 静的アライメント
  const [postureType, setPostureType] = useState<PostureType | ''>('')
  const [pelvicTilt, setPelvicTilt] = useState<PelvicTilt | ''>('')
  const [legAlignment, setLegAlignment] = useState<LegAlignment | ''>('')
  const [shoulderRoll, setShoulderRoll] = useState(false)
  const [forwardHead, setForwardHead] = useState(false)
  // 回旋（左右非対称）
  const [pelvicRotation, setPelvicRotation] = useState<Rotation>('neutral')
  const [shoulderRotation, setShoulderRotation] = useState<Rotation>('neutral')
  const [trunkRotationRestriction, setTrunkRotationRestriction] =
    useState<TrunkRotRestriction>('none')
  const [legLengthDiscrepancy, setLegLengthDiscrepancy] = useState(false)
  // 動作観察
  const [movementBend, setMovementBend] = useState<Side>('none')
  const [squatLeanSide, setSquatLeanSide] = useState<Side>('none')
  const [squatKneeIn, setSquatKneeIn] = useState<SquatKneeIn>('none')
  const [squatHeelLift, setSquatHeelLift] = useState(false)
  const [squatRoundBack, setSquatRoundBack] = useState(false)
  const [singleLegBalanceWeakSide, setSingleLegBalanceWeakSide] = useState<Side>('none')
  const [gaitAsymmetry, setGaitAsymmetry] = useState(false)
  const [jumpLandingAsymmetry, setJumpLandingAsymmetry] = useState<Side>('none')
  const [hipShiftDirection, setHipShiftDirection] = useState<Side>('none')
  // 関節成熟度
  const [jointHypermobility, setJointHypermobility] = useState(false)
  const [muscleToneFirm, setMuscleToneFirm] = useState(false)
  const [shoeSizeStable, setShoeSizeStable] = useState(false)

  // メモ
  const [notes, setNotes] = useState('')

  const ageYears = useMemo(() => {
    if (!birthdate) return 0
    const b = new Date(birthdate)
    const m = new Date(measuredAt || new Date().toISOString().slice(0, 10))
    if (isNaN(b.getTime()) || isNaN(m.getTime())) return 0
    const ms = m.getTime() - b.getTime()
    return Math.round((ms / (1000 * 60 * 60 * 24 * 365.25)) * 100) / 100
  }, [birthdate, measuredAt])

  const result = useMemo(() => {
    if (typeof heightCm !== 'number' || typeof weightKg !== 'number' || ageYears <= 0) {
      return null
    }
    const sibs = siblingsRaw
      .split(/[,、\s]+/)
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n) && n > 0)

    const pubertySigns: PubertySigns = {
      voiceChange,
      bodyHair,
      appetiteSurge,
      shoeSizeJump,
      menarche,
      menarcheMonthsAgo:
        typeof menarcheMonthsAgo === 'number' ? menarcheMonthsAgo : undefined,
    }

    const alignment: AlignmentSigns = {
      postureType: postureType || undefined,
      pelvicTilt: pelvicTilt || undefined,
      legAlignment: legAlignment || undefined,
      shoulderRoll,
      forwardHead,
      pelvicRotation,
      shoulderRotation,
      trunkRotationRestriction,
      legLengthDiscrepancy,
      movementBend,
      squatLeanSide,
      squatKneeIn,
      squatHeelLift,
      squatRoundBack,
      singleLegBalanceWeakSide,
      gaitAsymmetry,
      jumpLandingAsymmetry,
      hipShiftDirection,
      jointHypermobility,
      muscleToneFirm,
      shoeSizeStable,
    }

    const input: ProGrowthInput = {
      ageYears,
      sex,
      heightCm,
      weightKg,
      sittingHeightCm:
        typeof sittingHeightCm === 'number' ? sittingHeightCm : undefined,
      bodyFatPercent:
        typeof bodyFatPercent === 'number' ? bodyFatPercent : undefined,
      skeletalMuscleKg:
        typeof skeletalMuscleKg === 'number' ? skeletalMuscleKg : undefined,
      shoeSizeCm: typeof shoeSizeCm === 'number' ? shoeSizeCm : undefined,
      fatherHeightCm:
        typeof fatherHeightCm === 'number' ? fatherHeightCm : undefined,
      motherHeightCm:
        typeof motherHeightCm === 'number' ? motherHeightCm : undefined,
      siblingHeightsCm: sibs.length ? sibs : undefined,
      pubertySigns,
      alignment,
    }
    return predictGrowthPro(input)
  }, [
    ageYears,
    sex,
    heightCm,
    weightKg,
    sittingHeightCm,
    bodyFatPercent,
    skeletalMuscleKg,
    shoeSizeCm,
    fatherHeightCm,
    motherHeightCm,
    siblingsRaw,
    voiceChange,
    bodyHair,
    appetiteSurge,
    shoeSizeJump,
    menarche,
    menarcheMonthsAgo,
    postureType,
    pelvicTilt,
    legAlignment,
    shoulderRoll,
    forwardHead,
    pelvicRotation,
    shoulderRotation,
    trunkRotationRestriction,
    legLengthDiscrepancy,
    movementBend,
    squatLeanSide,
    squatKneeIn,
    squatHeelLift,
    squatRoundBack,
    singleLegBalanceWeakSide,
    gaitAsymmetry,
    jumpLandingAsymmetry,
    hipShiftDirection,
    jointHypermobility,
    muscleToneFirm,
    shoeSizeStable,
  ])

  // ===== PDF 出力 =====
  const reportRef = useRef<HTMLDivElement>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  const exportPDF = async () => {
    if (!reportRef.current || !result) return
    setPdfLoading(true)
    try {
      // html2canvas-pro は Tailwind 4 の oklch() カラーに対応している
      const html2canvas = (await import('html2canvas-pro')).default
      const jsPDF = (await import('jspdf')).default

      const el = reportRef.current
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')

      // A4 縦（210 × 297 mm）
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fname = `nobishiro-karte-${name || 'unknown'}-${measuredAt}.pdf`
      pdf.save(fname)
    } catch (e: unknown) {
      console.error('PDF生成失敗:', e)
      const msg = e instanceof Error ? e.message : String(e)
      alert(`PDF 出力に失敗しました\n${msg}`)
    } finally {
      setPdfLoading(false)
    }
  }

  // ===== UI =====
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest text-gray-400">
              TRAINER PRIVATE
            </p>
            <p className="font-bold">身長伸びしろ詳細診断（高精度版）</p>
          </div>
          <button
            onClick={exportPDF}
            disabled={!result || pdfLoading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            {pdfLoading ? 'PDF生成中…' : '📄 PDF出力'}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-2 gap-6">
        {/* ===== 入力フォーム ===== */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
          {/* 基本 */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">基本情報</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="お子様の名前">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="山田 太郎"
                />
              </Field>
              <Field label="生年月日">
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </Field>
              <Field label="性別">
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="male">男子</option>
                  <option value="female">女子</option>
                </select>
              </Field>
              <Field label="計測日">
                <input
                  type="date"
                  value={measuredAt}
                  onChange={(e) => setMeasuredAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </Field>
              <Field label="現在年齢">
                <div className="text-sm text-gray-700 px-3 py-2 bg-gray-50 rounded-lg">
                  {ageYears > 0 ? `${ageYears} 歳` : '生年月日と計測日を入力'}
                </div>
              </Field>
            </div>
          </div>

          {/* 身体測定 */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">
              身体測定（体験で測れるもの）
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="身長（cm）"
                value={heightCm}
                onChange={setHeightCm}
                step={0.1}
              />
              <NumField
                label="体重（kg）"
                value={weightKg}
                onChange={setWeightKg}
                step={0.1}
              />
              <NumField
                label="座高（cm）★PHV予測に必要"
                value={sittingHeightCm}
                onChange={setSittingHeightCm}
                step={0.1}
                hint="椅子にまっすぐ座って頭頂までの高さ"
              />
              <NumField
                label="体脂肪率（%）"
                value={bodyFatPercent}
                onChange={setBodyFatPercent}
                step={0.1}
                hint="InBody使用時"
              />
              <NumField
                label="骨格筋量（kg）"
                value={skeletalMuscleKg}
                onChange={setSkeletalMuscleKg}
                step={0.1}
              />
              <NumField
                label="足のサイズ（cm）"
                value={shoeSizeCm}
                onChange={setShoeSizeCm}
                step={0.5}
              />
            </div>
          </div>

          {/* 家族情報 */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">
              家族の身長（精度UP）
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="父の身長（cm）"
                value={fatherHeightCm}
                onChange={setFatherHeightCm}
                step={0.5}
              />
              <NumField
                label="母の身長（cm）"
                value={motherHeightCm}
                onChange={setMotherHeightCm}
                step={0.5}
              />
              <Field label="兄/姉の最終身長（cm、複数はカンマ区切り）" full>
                <input
                  type="text"
                  value={siblingsRaw}
                  onChange={(e) => setSiblingsRaw(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="172, 168"
                />
              </Field>
            </div>
          </div>

          {/* 思春期サイン */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">
              第二次性徴サイン（残り伸びしろ補正）
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {sex === 'male' && (
                <Check
                  label="声変わりが始まった/完了"
                  checked={voiceChange}
                  onChange={setVoiceChange}
                />
              )}
              <Check
                label="陰毛・腋毛が発現"
                checked={bodyHair}
                onChange={setBodyHair}
              />
              <Check
                label="食欲が急に増えた"
                checked={appetiteSurge}
                onChange={setAppetiteSurge}
              />
              <Check
                label="靴サイズが半年で1cm以上UP"
                checked={shoeSizeJump}
                onChange={setShoeSizeJump}
              />
              {sex === 'female' && (
                <>
                  <Check
                    label="初潮あり"
                    checked={menarche}
                    onChange={setMenarche}
                  />
                  {menarche && (
                    <NumField
                      label="初潮からの経過月数"
                      value={menarcheMonthsAgo}
                      onChange={setMenarcheMonthsAgo}
                      step={1}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* アライメント評価 */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">
              アライメント評価（姿勢観察）
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="姿勢タイプ">
                <select
                  value={postureType}
                  onChange={(e) => setPostureType(e.target.value as PostureType | '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">未評価</option>
                  <option value="normal">正常</option>
                  <option value="kyphotic">猫背</option>
                  <option value="lordotic">反り腰</option>
                  <option value="flat">平背</option>
                  <option value="sway-back">スウェイバック</option>
                </select>
              </Field>
              <Field label="骨盤傾斜">
                <select
                  value={pelvicTilt}
                  onChange={(e) => setPelvicTilt(e.target.value as PelvicTilt | '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">未評価</option>
                  <option value="neutral">中立</option>
                  <option value="anterior">前傾</option>
                  <option value="posterior">後傾</option>
                </select>
              </Field>
              <Field label="下肢アライメント">
                <select
                  value={legAlignment}
                  onChange={(e) => setLegAlignment(e.target.value as LegAlignment | '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">未評価</option>
                  <option value="normal">正常</option>
                  <option value="genu-valgum">X脚</option>
                  <option value="genu-varum">O脚</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Check label="巻き肩" checked={shoulderRoll} onChange={setShoulderRoll} />
              <Check label="頭部前方位" checked={forwardHead} onChange={setForwardHead} />
            </div>
          </div>

          {/* 回旋（左右非対称） */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">
              回旋・左右非対称（静的）
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="骨盤の回旋">
                <select
                  value={pelvicRotation}
                  onChange={(e) => setPelvicRotation(e.target.value as Rotation)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="neutral">中立</option>
                  <option value="left-forward">左が前に出ている</option>
                  <option value="right-forward">右が前に出ている</option>
                </select>
              </Field>
              <Field label="肩の回旋">
                <select
                  value={shoulderRotation}
                  onChange={(e) => setShoulderRotation(e.target.value as Rotation)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="neutral">中立</option>
                  <option value="left-forward">左が前に出ている</option>
                  <option value="right-forward">右が前に出ている</option>
                </select>
              </Field>
              <Field label="体幹回旋の制限">
                <select
                  value={trunkRotationRestriction}
                  onChange={(e) =>
                    setTrunkRotationRestriction(e.target.value as TrunkRotRestriction)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="none">なし</option>
                  <option value="left">左方向に制限</option>
                  <option value="right">右方向に制限</option>
                  <option value="both">両方向に制限</option>
                </select>
              </Field>
              <Check
                label="脚長差あり（実 or 機能性）"
                checked={legLengthDiscrepancy}
                onChange={setLegLengthDiscrepancy}
              />
            </div>
          </div>

          {/* 動作観察 */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">
              動作観察（動的アライメント）
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="動作中の体幹の倒れグセ">
                <select
                  value={movementBend}
                  onChange={(e) => setMovementBend(e.target.value as Side)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="none">なし</option>
                  <option value="left">左に倒れる</option>
                  <option value="right">右に倒れる</option>
                </select>
              </Field>
              <Field label="スクワット時の重心流れ">
                <select
                  value={squatLeanSide}
                  onChange={(e) => setSquatLeanSide(e.target.value as Side)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="none">なし</option>
                  <option value="left">左に流れる</option>
                  <option value="right">右に流れる</option>
                </select>
              </Field>
              <Field label="スクワット時の膝の内入り">
                <select
                  value={squatKneeIn}
                  onChange={(e) => setSquatKneeIn(e.target.value as SquatKneeIn)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="none">なし</option>
                  <option value="left">左のみ</option>
                  <option value="right">右のみ</option>
                  <option value="both">両側</option>
                </select>
              </Field>
              <Field label="片足立ちで弱い側">
                <select
                  value={singleLegBalanceWeakSide}
                  onChange={(e) =>
                    setSingleLegBalanceWeakSide(e.target.value as Side)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="none">左右差なし</option>
                  <option value="left">左が弱い</option>
                  <option value="right">右が弱い</option>
                </select>
              </Field>
              <Field label="跳躍着地の片側流れ">
                <select
                  value={jumpLandingAsymmetry}
                  onChange={(e) => setJumpLandingAsymmetry(e.target.value as Side)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="none">なし</option>
                  <option value="left">左に流れる</option>
                  <option value="right">右に流れる</option>
                </select>
              </Field>
              <Field label="動作中の骨盤シフト">
                <select
                  value={hipShiftDirection}
                  onChange={(e) => setHipShiftDirection(e.target.value as Side)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="none">中立</option>
                  <option value="left">左にシフト</option>
                  <option value="right">右にシフト</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Check
                label="しゃがみで踵が浮く"
                checked={squatHeelLift}
                onChange={setSquatHeelLift}
              />
              <Check
                label="しゃがみで腰が丸まる"
                checked={squatRoundBack}
                onChange={setSquatRoundBack}
              />
              <Check
                label="歩行・走行に左右非対称"
                checked={gaitAsymmetry}
                onChange={setGaitAsymmetry}
              />
            </div>
          </div>

          {/* 関節成熟度 */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">
              関節・成熟度の所見
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <Check
                label="関節弛緩性あり（成熟前傾向）"
                checked={jointHypermobility}
                onChange={setJointHypermobility}
              />
              <Check
                label="筋トーンしっかり（成熟兆候）"
                checked={muscleToneFirm}
                onChange={setMuscleToneFirm}
              />
              <Check
                label="靴サイズが半年安定（成長停止兆候）"
                checked={shoeSizeStable}
                onChange={setShoeSizeStable}
              />
            </div>
          </div>

          {/* メモ */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-2">
              トレーナーメモ（PDFには含めない）
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="ヒアリング内容・観察など"
            />
          </div>
        </section>

        {/* ===== 結果カード（PDFはここを出力） ===== */}
        <section>
          <div
            ref={reportRef}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5"
          >
            <header className="border-b border-gray-200 pb-3">
              <p className="text-[10px] tracking-widest text-gray-500 font-bold">
                NOBISHIRO KIDS / GROWTH KARTE — 高精度版
              </p>
              <h1 className="text-xl font-bold text-gray-900">
                {name || '— 名前未入力 —'}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {sex === 'male' ? '男子' : '女子'} ・ {ageYears > 0 ? `${ageYears}歳` : '年齢未入力'}
                ・ 計測日 {measuredAt}
              </p>
            </header>

            {!result && (
              <p className="text-sm text-gray-500 text-center py-8">
                身長・体重・年齢を入力すると結果が表示されます。
              </p>
            )}

            {result && (
              <>
                {/* メイン予測 */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-5">
                  <p className="text-[10px] tracking-widest text-blue-100">
                    最終身長予測（{labelMethod(result.finalPrediction.method)}）
                  </p>
                  <p className="text-4xl font-bold my-1">
                    {result.finalPrediction.center}
                    <span className="text-base font-normal ml-1">cm</span>
                  </p>
                  <p className="text-xs text-blue-100">
                    予測幅 {result.finalPrediction.min} 〜 {result.finalPrediction.max} cm
                  </p>
                  <div className="mt-3 pt-3 border-t border-blue-400/40 flex items-center justify-between">
                    <span className="text-xs">残り伸びしろ</span>
                    <span className="text-xl font-bold text-yellow-300">
                      約 {result.finalPrediction.remainingGrowthCm} cm
                    </span>
                  </div>
                </div>

                {/* SD値 */}
                <div
                  className={`rounded-xl p-4 border ${toneClass(result.currentSDTone)}`}
                >
                  <p className="text-[10px] font-bold mb-1">現在のSD値（学校保健統計）</p>
                  <p className="text-2xl font-bold">
                    {result.currentSD >= 0 ? '+' : ''}
                    {result.currentSD.toFixed(2)}
                  </p>
                  <p className="text-xs mt-1">{result.currentSDLabel}</p>
                  <p className="text-[11px] text-gray-700 mt-2">
                    同年齢平均 {result.norm.mean.toFixed(1)}cm（±{result.norm.sd.toFixed(1)}cm）
                  </p>
                </div>

                {/* PHV */}
                {result.phv && (
                  <div className="rounded-xl p-4 border border-emerald-200 bg-emerald-50">
                    <div className="flex items-baseline justify-between">
                      <p className="text-[10px] font-bold text-emerald-800">
                        PHV推定（Mirwald 2002 式）
                      </p>
                      <span className="text-[10px] font-bold text-emerald-900 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                        {result.phv.phase}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-emerald-900 mt-1">
                      ピーク年齢：約 {result.phv.estimatedAgeYears} 歳
                    </p>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      {result.phv.message}
                    </p>
                  </div>
                )}

                {/* Tanner Stage */}
                <div className="rounded-xl p-4 border border-purple-200 bg-purple-50">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[10px] font-bold text-purple-800">
                      Tanner Stage 推定
                    </p>
                    <span className="text-[10px] font-bold text-purple-900 bg-white px-2 py-0.5 rounded-full border border-purple-300">
                      {result.tanner.label}
                    </span>
                  </div>
                  <p className="text-xs text-purple-800 mt-2 leading-relaxed">
                    {result.tanner.message}
                  </p>
                </div>

                {/* 骨端線閉鎖予測 */}
                <div className="rounded-xl p-4 border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50">
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-[10px] font-bold text-orange-800">
                      骨端線閉鎖予測（成長終了の目安）
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        result.epiphysealClosure.confidence === 'high'
                          ? 'text-emerald-800 border-emerald-300 bg-white'
                          : result.epiphysealClosure.confidence === 'medium'
                            ? 'text-amber-800 border-amber-300 bg-white'
                            : 'text-gray-800 border-gray-300 bg-white'
                      }`}
                    >
                      信頼度: {result.epiphysealClosure.confidence}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-orange-700">予測閉鎖年齢</p>
                      <p className="text-2xl font-bold text-orange-900">
                        約 {result.epiphysealClosure.estimatedAgeAtClosure}
                        <span className="text-sm ml-1">歳</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-orange-700">残り期間</p>
                      <p className="text-2xl font-bold text-orange-900">
                        約 {result.epiphysealClosure.yearsRemaining}
                        <span className="text-sm ml-1">年</span>
                      </p>
                      <p className="text-[10px] text-orange-700">
                        ({result.epiphysealClosure.monthsRemaining}ヶ月)
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-orange-900 mt-3 leading-relaxed">
                    {result.epiphysealClosure.message}
                  </p>
                </div>

                {/* アライメント所見 */}
                {result.alignmentObservations.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-700 mb-2">
                      アライメント所見・改善提案
                    </p>
                    <ul className="space-y-1 text-xs text-gray-700 leading-relaxed">
                      {result.alignmentObservations.map((obs, i) => (
                        <li key={i} className="pl-3 relative">
                          <span className="absolute left-0 text-purple-500">●</span>
                          {obs}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* アライメント改善で見込める「見た目身長プラス幅」（CTA） */}
                {result.apparentHeightGain.hasIssues && (
                  <div className="rounded-2xl p-5 border-2 border-blue-300 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <p className="text-[10px] tracking-widest text-blue-100 font-bold mb-1">
                      EVIDENCE-BASED OPPORTUNITY
                    </p>
                    <h3 className="text-base md:text-lg font-bold mb-3">
                      アライメント改善で見込める「見た目身長プラス幅」
                    </h3>
                    <p className="text-xs text-blue-100 mb-3 leading-relaxed">
                      {result.apparentHeightGain.summary}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
                        <p className="text-[10px] text-blue-100">数週〜1ヶ月（即時）</p>
                        <p className="text-xl font-bold text-yellow-300">
                          +{result.apparentHeightGain.shortTerm.min.toFixed(1)}〜
                          {result.apparentHeightGain.shortTerm.max.toFixed(1)}
                          <span className="text-xs ml-1">cm</span>
                        </p>
                        <p className="text-[10px] text-blue-100 mt-1">
                          姿勢誘導・椎間板アンロード
                        </p>
                      </div>
                      <div className="bg-white/15 rounded-xl p-3 backdrop-blur border border-yellow-300/40">
                        <p className="text-[10px] text-blue-100">3〜6ヶ月（中期）</p>
                        <p className="text-2xl font-bold text-yellow-300">
                          +{result.apparentHeightGain.midTerm.min.toFixed(1)}〜
                          {result.apparentHeightGain.midTerm.max.toFixed(1)}
                          <span className="text-sm ml-1">cm</span>
                        </p>
                        <p className="text-[10px] text-blue-100 mt-1">
                          角度・トレーニング効果
                        </p>
                      </div>
                    </div>

                    {/* 寄与した項目の内訳 */}
                    <div className="bg-white/5 rounded-xl p-3 mt-3">
                      <p className="text-[10px] font-bold text-blue-100 mb-2">
                        寄与している項目（中期見込み内訳）
                      </p>
                      <ul className="space-y-1">
                        {result.apparentHeightGain.contributions.map((c) => (
                          <li
                            key={c.key}
                            className="flex items-baseline justify-between text-[11px] text-blue-50 leading-relaxed"
                          >
                            <span className="flex-1 pr-2">{c.label}</span>
                            <span className="text-yellow-200 font-bold whitespace-nowrap">
                              +{c.midMin.toFixed(1)}〜{c.midMax.toFixed(1)} cm
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="mt-4 pt-3 border-t border-blue-400/40">
                      <p className="text-xs text-white leading-relaxed">
                        💪 {result.apparentHeightGain.ctaMessage}
                      </p>
                    </div>

                    {/* 注意 */}
                    <p className="text-[10px] text-blue-100/80 mt-3 leading-relaxed">
                      {result.apparentHeightGain.caveat}
                    </p>

                    {/* 出典 */}
                    <details className="mt-3 group">
                      <summary className="text-[10px] text-blue-200 cursor-pointer font-bold hover:text-white">
                        📚 主要出典を表示（{result.apparentHeightGain.sources.length}件）
                      </summary>
                      <ul className="mt-2 space-y-0.5 text-[10px] text-blue-100/90">
                        {result.apparentHeightGain.sources.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}

                {/* 良好な場合の専用メッセージ */}
                {!result.apparentHeightGain.hasIssues && (
                  <div className="rounded-xl p-4 border border-emerald-300 bg-emerald-50">
                    <p className="text-[10px] font-bold text-emerald-800 mb-1">
                      アライメント評価
                    </p>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {result.apparentHeightGain.summary}
                      {' '}
                      {result.apparentHeightGain.ctaMessage}
                    </p>
                  </div>
                )}

                {/* 全予測手法の比較 */}
                <div>
                  <p className="text-[10px] font-bold text-gray-700 mb-2">
                    予測手法の比較
                  </p>
                  <div className="space-y-1">
                    {result.predictions.map((p) => (
                      <div
                        key={p.method}
                        className="flex items-center justify-between text-xs px-3 py-2 bg-gray-50 rounded"
                      >
                        <span className="text-gray-700 font-medium">{p.label}</span>
                        <span className="text-gray-900 font-bold">
                          {p.center} cm
                          <span className="text-gray-400 font-normal ml-1">
                            ({p.min}〜{p.max})
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 思春期補正 */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-amber-800 mb-1">
                    思春期サインによる補正
                  </p>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    補正係数 ×{result.puberty.multiplier} ／ {result.puberty.message}
                  </p>
                </div>

                {/* 所見 */}
                <div>
                  <p className="text-[10px] font-bold text-gray-700 mb-2">
                    トレーナー所見・推奨アプローチ
                  </p>
                  <ul className="space-y-1 text-xs text-gray-700 leading-relaxed">
                    {result.notes.map((n, i) => (
                      <li key={i} className="pl-3 relative">
                        <span className="absolute left-0 text-blue-500">●</span>
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 免責 */}
                <div className="border-t border-gray-200 pt-3 text-[10px] text-gray-500 leading-relaxed">
                  ※ {result.disclaimer}
                </div>

                <div className="text-[10px] text-gray-400 text-center pt-2 border-t border-gray-100">
                  FIREFITNESS / NOBISHIRO KIDS — Trainer Private Edition
                </div>
              </>
            )}
          </div>

          {result && (
            <p className="text-xs text-gray-500 text-center mt-3">
              「PDF出力」ボタンを押すと A4縦のレポートとして保存できます。
            </p>
          )}
        </section>
      </div>
    </main>
  )
}

// ===== 補助コンポーネント =====
function Field({
  label,
  children,
  full,
}: {
  label: string
  children: React.ReactNode
  full?: boolean
}) {
  return (
    <label className={`flex flex-col gap-1 ${full ? 'col-span-2' : ''}`}>
      <span className="text-[11px] text-gray-700 font-medium">{label}</span>
      {children}
    </label>
  )
}

function NumField({
  label,
  value,
  onChange,
  step,
  hint,
}: {
  label: string
  value: number | ''
  onChange: (v: number | '') => void
  step?: number
  hint?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-gray-700 font-medium">
        {label}
        {hint && <span className="text-gray-400 ml-1">— {hint}</span>}
      </span>
      <input
        type="number"
        step={step ?? 1}
        value={value}
        onChange={(e) => {
          const v = e.target.value
          if (v === '') onChange('')
          else onChange(parseFloat(v) || 0)
        }}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
      />
    </label>
  )
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4"
      />
      <span className="text-xs text-gray-800">{label}</span>
    </label>
  )
}

function toneClass(tone: 'safe' | 'watch' | 'consult'): string {
  if (tone === 'safe') return 'border-emerald-200 bg-emerald-50 text-emerald-900'
  if (tone === 'watch') return 'border-amber-200 bg-amber-50 text-amber-900'
  return 'border-red-200 bg-red-50 text-red-900'
}

function labelMethod(method: string): string {
  const m: Record<string, string> = {
    'bayley-pinneau-with-parents': 'Bayley-Pinneau簡易法 + 両親身長 + 思春期補正',
    'bayley-pinneau': 'Bayley-Pinneau簡易法（達成率）+ 思春期補正',
    midparental: '両親身長式 + 思春期補正',
    'sd-extrapolation': 'SD値外挿 + 思春期補正',
    'sibling-reference': '兄/姉参考',
  }
  return m[method] ?? method
}
