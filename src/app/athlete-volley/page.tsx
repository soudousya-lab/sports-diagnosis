'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getSchoolYearDisplay } from '@/lib/volleyball-diagnosis'
import { HiOutlinePlus, HiOutlineChartBar, HiOutlinePencil, HiOutlineUserGroup, HiOutlineCalendar } from 'react-icons/hi'

type Athlete = {
  id: string
  name: string
  school_year: string
  gender: 'male' | 'female'
  position: string | null
  team_name: string
  created_at: string
  volleyball_measurements: {
    id: string
    measured_at: string
  }[]
}

export default function AthleteVolleyTopPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTeam, setFilterTeam] = useState<string>('')
  const [teams, setTeams] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('volleyball_athletes')
          .select(`
            id,
            name,
            school_year,
            gender,
            position,
            team_name,
            created_at,
            volleyball_measurements (
              id,
              measured_at
            )
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Fetch error:', error)
        } else if (data) {
          setAthletes(data as Athlete[])
          // チーム一覧を抽出
          const uniqueTeams = [...new Set(data.map(a => a.team_name).filter(Boolean))]
          setTeams(uniqueTeams)
        }
      } catch (err) {
        console.error('Error:', err)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const filteredAthletes = filterTeam
    ? athletes.filter(a => a.team_name === filterTeam)
    : athletes

  const getLatestMeasurement = (athlete: Athlete) => {
    if (!athlete.volleyball_measurements || athlete.volleyball_measurements.length === 0) {
      return null
    }
    return athlete.volleyball_measurements.sort(
      (a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
    )[0]
  }

  const getPositionDisplay = (position: string | null) => {
    const positions: Record<string, string> = {
      'S': 'セッター',
      'OH': 'アウトサイドヒッター',
      'MB': 'ミドルブロッカー',
      'OP': 'オポジット',
      'L': 'リベロ'
    }
    return position ? positions[position] || position : '未設定'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-700">
      {/* ヘッダー */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider">
                NOBISHIRO ATHLETE
              </h1>
              <p className="text-orange-200 text-xs sm:text-sm">VOLLEYBALL</p>
            </div>
            <Link
              href="/athlete-volley/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-700 rounded-lg font-medium text-sm hover:bg-orange-50 transition-colors shadow-lg"
            >
              <HiOutlinePlus className="w-5 h-5" />
              <span className="hidden sm:inline">新規測定</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
            <HiOutlineUserGroup className="w-8 h-8 mb-2 text-orange-200" />
            <div className="text-2xl font-bold">{athletes.length}</div>
            <div className="text-xs text-orange-200">登録選手数</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
            <HiOutlineChartBar className="w-8 h-8 mb-2 text-orange-200" />
            <div className="text-2xl font-bold">
              {athletes.reduce((sum, a) => sum + (a.volleyball_measurements?.length || 0), 0)}
            </div>
            <div className="text-xs text-orange-200">総測定回数</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
            <HiOutlineCalendar className="w-8 h-8 mb-2 text-orange-200" />
            <div className="text-2xl font-bold">{teams.length}</div>
            <div className="text-xs text-orange-200">チーム数</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
            <HiOutlinePlus className="w-8 h-8 mb-2 text-orange-200" />
            <Link href="/athlete-volley/new" className="text-sm underline hover:no-underline">
              測定を追加
            </Link>
          </div>
        </div>

        {/* フィルター */}
        {teams.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterTeam('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterTeam === ''
                    ? 'bg-white text-orange-700'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                全て
              </button>
              {teams.map(team => (
                <button
                  key={team}
                  onClick={() => setFilterTeam(team)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterTeam === team
                      ? 'bg-white text-orange-700'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 選手一覧 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">選手一覧</h2>
            <p className="text-sm text-gray-500">登録済みの選手と最新の測定データ</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">読み込み中...</div>
          ) : filteredAthletes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">選手が登録されていません</p>
              <Link
                href="/athlete-volley/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                <HiOutlinePlus className="w-5 h-5" />
                最初の選手を登録
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAthletes.map(athlete => {
                const latestMeasurement = getLatestMeasurement(athlete)
                return (
                  <div key={athlete.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {athlete.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{athlete.name}</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                              {getSchoolYearDisplay(athlete.school_year)}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {athlete.gender === 'male' ? '男子' : '女子'}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {getPositionDisplay(athlete.position)}
                            </span>
                          </div>
                          {athlete.team_name && (
                            <div className="text-xs text-gray-500 mt-1">{athlete.team_name}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {latestMeasurement ? (
                          <>
                            <Link
                              href={`/athlete-volley/result/${latestMeasurement.id}`}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                            >
                              <HiOutlineChartBar className="w-4 h-4" />
                              <span className="hidden sm:inline">結果</span>
                            </Link>
                            <Link
                              href={`/athlete-volley/edit/${latestMeasurement.id}`}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              <HiOutlinePencil className="w-4 h-4" />
                              <span className="hidden sm:inline">編集</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={`/athlete-volley/new?athlete_id=${athlete.id}`}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                          >
                            <HiOutlinePlus className="w-4 h-4" />
                            測定追加
                          </Link>
                        )}
                      </div>
                    </div>

                    {latestMeasurement && (
                      <div className="mt-3 text-xs text-gray-500">
                        最終測定: {new Date(latestMeasurement.measured_at).toLocaleDateString('ja-JP')}
                        <span className="ml-2 text-gray-400">
                          (計{athlete.volleyball_measurements.length}回)
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-orange-200 text-xs">
          <p>&copy; 2025 NOBISHIRO ATHLETE VOLLEYBALL</p>
        </div>
      </main>
    </div>
  )
}
