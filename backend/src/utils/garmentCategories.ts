// Garment Categories and Subcategories Configuration
// デジタルワードローブシステムのカテゴリー管理

export interface GarmentCategory {
  id: string
  name: string
  nameJa: string
  description: string
  subcategories: GarmentSubcategory[]
}

export interface GarmentSubcategory {
  id: string
  name: string
  nameJa: string
  description: string
  tags: string[]
}

export interface GarmentSize {
  category: string
  sizes: string[]
}

export interface GarmentColor {
  id: string
  name: string
  nameJa: string
  hex: string
  category: 'neutral' | 'warm' | 'cool' | 'bright' | 'dark'
}

// Primary garment categories
export const GARMENT_CATEGORIES: GarmentCategory[] = [
  {
    id: 'tops',
    name: 'Tops',
    nameJa: 'トップス',
    description: 'Upper body clothing items',
    subcategories: [
      {
        id: 'tshirt',
        name: 'T-Shirt',
        nameJa: 'Tシャツ',
        description: 'Short-sleeved casual shirts',
        tags: ['casual', 'cotton', 'summer', 'basic']
      },
      {
        id: 'shirt',
        name: 'Shirt',
        nameJa: 'シャツ',
        description: 'Button-up shirts and blouses',
        tags: ['formal', 'business', 'cotton', 'collar']
      },
      {
        id: 'polo',
        name: 'Polo Shirt',
        nameJa: 'ポロシャツ',
        description: 'Collared shirts with button placket',
        tags: ['casual', 'sport', 'collar', 'cotton']
      },
      {
        id: 'tank',
        name: 'Tank Top',
        nameJa: 'タンクトップ',
        description: 'Sleeveless tops',
        tags: ['casual', 'summer', 'sleeveless', 'light']
      },
      {
        id: 'sweater',
        name: 'Sweater',
        nameJa: 'セーター',
        description: 'Knitted warm tops',
        tags: ['winter', 'warm', 'knit', 'wool']
      },
      {
        id: 'hoodie',
        name: 'Hoodie',
        nameJa: 'パーカー',
        description: 'Hooded sweatshirts',
        tags: ['casual', 'warm', 'hood', 'cotton']
      },
      {
        id: 'cardigan',
        name: 'Cardigan',
        nameJa: 'カーディガン',
        description: 'Open-front knitted garments',
        tags: ['layering', 'knit', 'button', 'elegant']
      },
      {
        id: 'vest',
        name: 'Vest',
        nameJa: 'ベスト',
        description: 'Sleeveless upper garments',
        tags: ['layering', 'formal', 'sleeveless']
      }
    ]
  },
  {
    id: 'bottoms',
    name: 'Bottoms',
    nameJa: 'ボトムス',
    description: 'Lower body clothing items',
    subcategories: [
      {
        id: 'jeans',
        name: 'Jeans',
        nameJa: 'ジーンズ',
        description: 'Denim pants',
        tags: ['casual', 'denim', 'durable', 'cotton']
      },
      {
        id: 'pants',
        name: 'Pants',
        nameJa: 'パンツ',
        description: 'Formal and casual trousers',
        tags: ['formal', 'business', 'tailored']
      },
      {
        id: 'shorts',
        name: 'Shorts',
        nameJa: 'ショーツ',
        description: 'Short pants',
        tags: ['casual', 'summer', 'short', 'comfortable']
      },
      {
        id: 'skirt',
        name: 'Skirt',
        nameJa: 'スカート',
        description: 'Lower garments for women',
        tags: ['feminine', 'elegant', 'flowing']
      },
      {
        id: 'dress_pants',
        name: 'Dress Pants',
        nameJa: 'ドレスパンツ',
        description: 'Formal business trousers',
        tags: ['formal', 'business', 'professional', 'tailored']
      },
      {
        id: 'leggings',
        name: 'Leggings',
        nameJa: 'レギンス',
        description: 'Tight-fitting stretch pants',
        tags: ['stretch', 'comfortable', 'fitness', 'casual']
      },
      {
        id: 'chinos',
        name: 'Chinos',
        nameJa: 'チノパン',
        description: 'Casual cotton twill pants',
        tags: ['casual', 'cotton', 'versatile', 'comfortable']
      }
    ]
  },
  {
    id: 'outerwear',
    name: 'Outerwear',
    nameJa: 'アウター',
    description: 'Outer layer clothing for protection and style',
    subcategories: [
      {
        id: 'jacket',
        name: 'Jacket',
        nameJa: 'ジャケット',
        description: 'Formal and casual jackets',
        tags: ['formal', 'layering', 'structured']
      },
      {
        id: 'coat',
        name: 'Coat',
        nameJa: 'コート',
        description: 'Long outer garments',
        tags: ['winter', 'warm', 'long', 'elegant']
      },
      {
        id: 'blazer',
        name: 'Blazer',
        nameJa: 'ブレザー',
        description: 'Semi-formal suit jackets',
        tags: ['formal', 'business', 'tailored', 'structured']
      },
      {
        id: 'windbreaker',
        name: 'Windbreaker',
        nameJa: 'ウィンドブレーカー',
        description: 'Lightweight wind-resistant jackets',
        tags: ['sport', 'light', 'windproof', 'casual']
      },
      {
        id: 'puffer',
        name: 'Puffer Jacket',
        nameJa: 'ダウンジャケット',
        description: 'Insulated quilted jackets',
        tags: ['winter', 'warm', 'insulated', 'puffy']
      },
      {
        id: 'trench',
        name: 'Trench Coat',
        nameJa: 'トレンチコート',
        description: 'Long belted rain coats',
        tags: ['elegant', 'classic', 'waterproof', 'long']
      },
      {
        id: 'bomber',
        name: 'Bomber Jacket',
        nameJa: 'ボンバージャケット',
        description: 'Short zip-up jackets',
        tags: ['casual', 'sporty', 'zip', 'ribbed']
      }
    ]
  },
  {
    id: 'footwear',
    name: 'Footwear',
    nameJa: '靴',
    description: 'Shoes and foot accessories',
    subcategories: [
      {
        id: 'sneakers',
        name: 'Sneakers',
        nameJa: 'スニーカー',
        description: 'Casual athletic shoes',
        tags: ['casual', 'sport', 'comfortable', 'rubber']
      },
      {
        id: 'dress_shoes',
        name: 'Dress Shoes',
        nameJa: 'ドレスシューズ',
        description: 'Formal leather shoes',
        tags: ['formal', 'business', 'leather', 'polished']
      },
      {
        id: 'boots',
        name: 'Boots',
        nameJa: 'ブーツ',
        description: 'High-cut shoes covering the ankle',
        tags: ['winter', 'durable', 'ankle', 'leather']
      },
      {
        id: 'sandals',
        name: 'Sandals',
        nameJa: 'サンダル',
        description: 'Open summer footwear',
        tags: ['summer', 'open', 'breathable', 'casual']
      },
      {
        id: 'loafers',
        name: 'Loafers',
        nameJa: 'ローファー',
        description: 'Slip-on dress shoes',
        tags: ['formal', 'slip-on', 'leather', 'elegant']
      },
      {
        id: 'heels',
        name: 'Heels',
        nameJa: 'ハイヒール',
        description: 'High-heeled shoes',
        tags: ['formal', 'feminine', 'elegant', 'height']
      },
      {
        id: 'flats',
        name: 'Flats',
        nameJa: 'フラットシューズ',
        description: 'Low-profile shoes without heels',
        tags: ['comfortable', 'casual', 'flat', 'feminine']
      }
    ]
  },
  {
    id: 'accessories',
    name: 'Accessories',
    nameJa: 'アクセサリー',
    description: 'Fashion accessories and complementary items',
    subcategories: [
      {
        id: 'belt',
        name: 'Belt',
        nameJa: 'ベルト',
        description: 'Waist accessories',
        tags: ['waist', 'leather', 'buckle', 'functional']
      },
      {
        id: 'hat',
        name: 'Hat',
        nameJa: '帽子',
        description: 'Head accessories',
        tags: ['head', 'sun protection', 'style']
      },
      {
        id: 'scarf',
        name: 'Scarf',
        nameJa: 'スカーフ',
        description: 'Neck accessories',
        tags: ['neck', 'warm', 'elegant', 'layering']
      },
      {
        id: 'bag',
        name: 'Bag',
        nameJa: 'バッグ',
        description: 'Carrying accessories',
        tags: ['carry', 'functional', 'style', 'storage']
      },
      {
        id: 'jewelry',
        name: 'Jewelry',
        nameJa: 'ジュエリー',
        description: 'Decorative accessories',
        tags: ['decorative', 'metal', 'elegant', 'valuable']
      },
      {
        id: 'watch',
        name: 'Watch',
        nameJa: '時計',
        description: 'Timepiece accessories',
        tags: ['time', 'wrist', 'functional', 'elegant']
      },
      {
        id: 'sunglasses',
        name: 'Sunglasses',
        nameJa: 'サングラス',
        description: 'Eye protection accessories',
        tags: ['eyes', 'sun protection', 'style', 'cool']
      },
      {
        id: 'gloves',
        name: 'Gloves',
        nameJa: '手袋',
        description: 'Hand accessories',
        tags: ['hands', 'warm', 'winter', 'protection']
      }
    ]
  }
]

// Size configurations for different categories
export const GARMENT_SIZES: GarmentSize[] = [
  {
    category: 'tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  },
  {
    category: 'bottoms',
    sizes: ['24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '36', '38', '40', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  {
    category: 'outerwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  },
  {
    category: 'footwear',
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48']
  },
  {
    category: 'accessories',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'One Size', 'Adjustable']
  }
]

// Color palette for garments
export const GARMENT_COLORS: GarmentColor[] = [
  // Neutral colors
  { id: 'black', name: 'Black', nameJa: '黒', hex: '#000000', category: 'neutral' },
  { id: 'white', name: 'White', nameJa: '白', hex: '#FFFFFF', category: 'neutral' },
  { id: 'gray', name: 'Gray', nameJa: 'グレー', hex: '#808080', category: 'neutral' },
  { id: 'beige', name: 'Beige', nameJa: 'ベージュ', hex: '#F5F5DC', category: 'neutral' },
  { id: 'brown', name: 'Brown', nameJa: '茶色', hex: '#A52A2A', category: 'neutral' },
  { id: 'cream', name: 'Cream', nameJa: 'クリーム', hex: '#FFFDD0', category: 'neutral' },
  
  // Warm colors
  { id: 'red', name: 'Red', nameJa: '赤', hex: '#FF0000', category: 'warm' },
  { id: 'orange', name: 'Orange', nameJa: 'オレンジ', hex: '#FFA500', category: 'warm' },
  { id: 'yellow', name: 'Yellow', nameJa: '黄色', hex: '#FFFF00', category: 'warm' },
  { id: 'coral', name: 'Coral', nameJa: 'コーラル', hex: '#FF7F50', category: 'warm' },
  { id: 'burgundy', name: 'Burgundy', nameJa: 'バーガンディ', hex: '#800020', category: 'warm' },
  
  // Cool colors
  { id: 'blue', name: 'Blue', nameJa: '青', hex: '#0000FF', category: 'cool' },
  { id: 'navy', name: 'Navy', nameJa: 'ネイビー', hex: '#000080', category: 'cool' },
  { id: 'green', name: 'Green', nameJa: '緑', hex: '#00FF00', category: 'cool' },
  { id: 'purple', name: 'Purple', nameJa: '紫', hex: '#800080', category: 'cool' },
  { id: 'teal', name: 'Teal', nameJa: 'ティール', hex: '#008080', category: 'cool' },
  { id: 'turquoise', name: 'Turquoise', nameJa: 'ターコイズ', hex: '#40E0D0', category: 'cool' },
  
  // Bright colors
  { id: 'pink', name: 'Pink', nameJa: 'ピンク', hex: '#FFC0CB', category: 'bright' },
  { id: 'lime', name: 'Lime', nameJa: 'ライム', hex: '#00FF00', category: 'bright' },
  { id: 'cyan', name: 'Cyan', nameJa: 'シアン', hex: '#00FFFF', category: 'bright' },
  { id: 'magenta', name: 'Magenta', nameJa: 'マゼンタ', hex: '#FF00FF', category: 'bright' },
  
  // Dark colors
  { id: 'charcoal', name: 'Charcoal', nameJa: 'チャコール', hex: '#36454F', category: 'dark' },
  { id: 'olive', name: 'Olive', nameJa: 'オリーブ', hex: '#808000', category: 'dark' },
  { id: 'maroon', name: 'Maroon', nameJa: 'マルーン', hex: '#800000', category: 'dark' },
  { id: 'indigo', name: 'Indigo', nameJa: 'インディゴ', hex: '#4B0082', category: 'dark' }
]

// Common garment materials
export const GARMENT_MATERIALS = [
  'Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Leather',
  'Cashmere', 'Viscose', 'Nylon', 'Spandex', 'Bamboo', 'Modal',
  'Acrylic', 'Fleece', 'Chiffon', 'Satin', 'Velvet', 'Corduroy',
  'Tweed', 'Canvas', 'Suede', 'Mesh', 'Jersey', 'Flannel'
]

// Common brands (can be extended)
export const COMMON_BRANDS = [
  'Uniqlo', 'H&M', 'Zara', 'Gap', 'Nike', 'Adidas', 'Muji', 'GU',
  'Ralph Lauren', 'Tommy Hilfiger', 'Calvin Klein', 'Levi\'s',
  'Patagonia', 'North Face', 'Under Armour', 'Puma', 'Converse',
  'Vans', 'Supreme', 'Champion', 'Lacoste', 'Hugo Boss',
  'Armani', 'Versace', 'Gucci', 'Prada', 'Louis Vuitton',
  'Comme des Garcons', 'Issey Miyake', 'Yohji Yamamoto'
]

// Utility functions
export function getCategoryById(categoryId: string): GarmentCategory | undefined {
  return GARMENT_CATEGORIES.find(category => category.id === categoryId)
}

export function getSubcategoryById(categoryId: string, subcategoryId: string): GarmentSubcategory | undefined {
  const category = getCategoryById(categoryId)
  return category?.subcategories.find(subcategory => subcategory.id === subcategoryId)
}

export function getAllSubcategories(): Array<GarmentSubcategory & { categoryId: string }> {
  return GARMENT_CATEGORIES.flatMap(category =>
    category.subcategories.map(subcategory => ({
      ...subcategory,
      categoryId: category.id
    }))
  )
}

export function getSizesForCategory(categoryId: string): string[] {
  const sizeConfig = GARMENT_SIZES.find(size => size.category === categoryId)
  return sizeConfig?.sizes || []
}

export function getColorByName(colorName: string): GarmentColor | undefined {
  return GARMENT_COLORS.find(color => 
    color.name.toLowerCase() === colorName.toLowerCase() ||
    color.nameJa === colorName
  )
}

export function getColorsByCategory(category: string): GarmentColor[] {
  return GARMENT_COLORS.filter(color => color.category === category)
}

export function isValidCategory(categoryId: string): boolean {
  return GARMENT_CATEGORIES.some(category => category.id === categoryId)
}

export function isValidSubcategory(categoryId: string, subcategoryId: string): boolean {
  const category = getCategoryById(categoryId)
  return category?.subcategories.some(subcategory => subcategory.id === subcategoryId) || false
}

// Search and filtering helpers
export function searchCategories(query: string): GarmentCategory[] {
  const lowerQuery = query.toLowerCase()
  return GARMENT_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(lowerQuery) ||
    category.nameJa.includes(lowerQuery) ||
    category.description.toLowerCase().includes(lowerQuery) ||
    category.subcategories.some(sub =>
      sub.name.toLowerCase().includes(lowerQuery) ||
      sub.nameJa.includes(lowerQuery) ||
      sub.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  )
}

export function getTagsForCategory(categoryId: string): string[] {
  const category = getCategoryById(categoryId)
  if (!category) return []
  
  const allTags = category.subcategories.flatMap(subcategory => subcategory.tags)
  return [...new Set(allTags)] // Remove duplicates
}

export function getAllTags(): string[] {
  const allTags = GARMENT_CATEGORIES.flatMap(category =>
    category.subcategories.flatMap(subcategory => subcategory.tags)
  )
  return [...new Set(allTags)].sort()
}