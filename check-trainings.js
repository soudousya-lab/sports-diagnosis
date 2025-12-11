const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function main() {
  const { data, error } = await supabase
    .from('trainings')
    .select('name, ability_key, age_group')
    .order('name')

  if (error) {
    console.error('Error:', error.message)
    return
  }

  console.log('\n=== トレーニング一覧 ===\n')
  console.log('必要な画像ファイル名:')
  const uniqueNames = [...new Set(data.map(t => t.name))]
  uniqueNames.forEach(name => {
    const filename = name.replace(/\s/g, '_') + '.jpg'
    console.log(`  ${filename}  ← "${name}"`)
  })
  console.log(`\n合計: ${uniqueNames.length} 種類`)
}

main()
