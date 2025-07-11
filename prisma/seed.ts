import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // サンプルユーザーの作成
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@pocket-stylist.com' },
    update: {},
    create: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'demo@pocket-stylist.com',
      name: 'デモユーザー',
      auth0Id: 'auth0|demo123',
      gender: 'other',
      preferences: {
        style: 'casual',
        colors: ['navy', 'gray', 'white'],
        brands: ['Uniqlo', 'Muji'],
      },
    },
  })

  console.log('✅ Demo user created:', demoUser.email)

  // ボディプロファイルの作成
  const bodyProfile = await prisma.bodyProfile.upsert({
    where: { id: '234e4567-e89b-12d3-a456-426614174001' },
    update: {},
    create: {
      id: '234e4567-e89b-12d3-a456-426614174001',
      userId: demoUser.id,
      height: 165,
      weight: 60,
      bodyType: 'athletic',
      skinTone: 'warm',
      measurements: {
        chest: 88,
        waist: 70,
        hips: 92,
      },
      fitPreferences: 'regular',
    },
  })

  console.log('✅ Body profile created for user:', demoUser.email)

  // サンプル衣服データの作成
  const garments = [
    {
      id: '345e4567-e89b-12d3-a456-426614174002',
      name: 'ホワイトシャツ',
      category: 'tops',
      subcategory: 'shirt',
      brand: 'Uniqlo',
      color: 'white',
      size: 'M',
      material: 'cotton',
      price: 2990.0,
      tags: ['casual', 'work', 'basic'],
      condition: 'new' as const,
    },
    {
      id: '456e4567-e89b-12d3-a456-426614174003',
      name: 'ダークデニム',
      category: 'bottoms',
      subcategory: 'jeans',
      brand: 'Muji',
      color: 'indigo',
      size: 'M',
      material: 'denim',
      price: 4990.0,
      tags: ['casual', 'durable'],
      condition: 'like_new' as const,
    },
    {
      id: '567e4567-e89b-12d3-a456-426614174004',
      name: 'ニットセーター',
      category: 'tops',
      subcategory: 'sweater',
      brand: 'Uniqlo',
      color: 'navy',
      size: 'M',
      material: 'wool',
      price: 3990.0,
      tags: ['warm', 'winter', 'casual'],
      condition: 'good' as const,
    },
    {
      id: '678e4567-e89b-12d3-a456-426614174005',
      name: 'レザーシューズ',
      category: 'shoes',
      subcategory: 'dress_shoes',
      brand: 'ABC-MART',
      color: 'black',
      size: '26.0',
      material: 'leather',
      price: 8990.0,
      tags: ['formal', 'business', 'leather'],
      condition: 'new' as const,
    },
  ]

  await Promise.all(
    garments.map(garmentData =>
      prisma.garment.upsert({
        where: { id: garmentData.id },
        update: {},
        create: {
          ...garmentData,
          userId: demoUser.id,
        },
      })
    )
  )

  console.log(`✅ Created ${garments.length} sample garments`)

  // サンプルコーディネートの作成
  const outfit = await prisma.outfit.upsert({
    where: { id: '789e4567-e89b-12d3-a456-426614174006' },
    update: {},
    create: {
      id: '789e4567-e89b-12d3-a456-426614174006',
      userId: demoUser.id,
      name: 'カジュアルビジネス',
      occasion: 'work',
      season: 'spring',
      weather: 'mild',
      aiDescription: 'シンプルで洗練されたビジネスカジュアルスタイル',
      isFavorite: true,
    },
  })

  // コーディネートアイテムの関連付け
  const outfitItems = [
    {
      id: '890e4567-e89b-12d3-a456-426614174007',
      outfitId: outfit.id,
      garmentId: garments[0].id, // ホワイトシャツ
      category: 'tops',
      displayOrder: 1,
    },
    {
      id: '901e4567-e89b-12d3-a456-426614174008',
      outfitId: outfit.id,
      garmentId: garments[1].id, // ダークデニム
      category: 'bottoms',
      displayOrder: 2,
    },
    {
      id: '012e4567-e89b-12d3-a456-426614174009',
      outfitId: outfit.id,
      garmentId: garments[3].id, // レザーシューズ
      category: 'shoes',
      displayOrder: 3,
    },
  ]

  await Promise.all(
    outfitItems.map(itemData =>
      prisma.outfitItem.upsert({
        where: { id: itemData.id },
        update: {},
        create: itemData,
      })
    )
  )

  console.log('✅ Created sample outfit with items')

  // サンプル注文の作成
  const order = await prisma.order.upsert({
    where: { orderNumber: 'ORDER-2024-001' },
    update: {},
    create: {
      id: '123e4567-e89b-12d3-a456-426614174010',
      userId: demoUser.id,
      orderNumber: 'ORDER-2024-001',
      status: 'delivered',
      totalAmount: 6980.0,
      shippingAddress: '東京都渋谷区渋谷1-1-1',
      paymentMethod: 'credit_card',
      shippedAt: new Date('2024-01-10T10:00:00Z'),
      deliveredAt: new Date('2024-01-12T14:30:00Z'),
    },
  })

  // 注文アイテムの作成
  const orderItems = [
    {
      id: '234e4567-e89b-12d3-a456-426614174011',
      orderId: order.id,
      garmentId: garments[0].id, // ホワイトシャツ
      quantity: 1,
      unitPrice: 2990.0,
      totalPrice: 2990.0,
    },
    {
      id: '345e4567-e89b-12d3-a456-426614174012',
      orderId: order.id,
      garmentId: garments[2].id, // ニットセーター
      quantity: 1,
      unitPrice: 3990.0,
      totalPrice: 3990.0,
    },
  ]

  await Promise.all(
    orderItems.map(itemData =>
      prisma.orderItem.upsert({
        where: { id: itemData.id },
        update: {},
        create: itemData,
      })
    )
  )

  console.log('✅ Created sample order with items')

  // 試着記録の作成
  const tryon = await prisma.tryon.upsert({
    where: { id: '456e4567-e89b-12d3-a456-426614174013' },
    update: {},
    create: {
      id: '456e4567-e89b-12d3-a456-426614174013',
      userId: demoUser.id,
      bodyProfileId: bodyProfile.id,
      sessionId: 'session-demo-001',
      aiAnalysis:
        'このコンビネーションは体型に非常によく合っています。シャツとジーンズの組み合わせが自然で、カジュアルながらも洗練された印象を与えます。',
      confidenceScore: 0.92,
    },
  })

  // 試着衣服の関連付け
  const tryonGarments = [
    {
      id: '780e4567-e89b-12d3-a456-426614174015',
      tryonId: tryon.id,
      garmentId: garments[0].id, // ホワイトシャツ
    },
    {
      id: '781e4567-e89b-12d3-a456-426614174016',
      tryonId: tryon.id,
      garmentId: garments[1].id, // ダークデニム
    },
  ]

  await Promise.all(
    tryonGarments.map(garmentData =>
      prisma.tryonGarment.upsert({
        where: { id: garmentData.id },
        update: {},
        create: garmentData,
      })
    )
  )

  // 試着結果の作成
  await prisma.tryonResult.upsert({
    where: { id: '567e4567-e89b-12d3-a456-426614174014' },
    update: {},
    create: {
      id: '567e4567-e89b-12d3-a456-426614174014',
      tryonId: tryon.id,
      resultImageUrl: 'https://example.com/tryon-results/result-1.jpg',
      overlayData: 'overlay_data_placeholder',
      fitAnalysis: {
        overall_fit: 'excellent',
        areas: {
          shoulders: 'perfect',
          chest: 'good',
          waist: 'excellent',
          length: 'good',
        },
        recommendations: ['この組み合わせは完璧です！'],
      },
      rating: 4.5,
    },
  })

  console.log('✅ Created sample tryon with garments and results')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
