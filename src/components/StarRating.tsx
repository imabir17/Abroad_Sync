'use client'

import { useState } from 'react'
import { Star, Eraser } from 'lucide-react'

// Translation utility for legacy text ratings to star ratings
export function getStarCount(rating: string | null | undefined): number {
  if (!rating) return 0
  if (rating === 'Very Good') return 5
  if (rating === 'Good') return 4
  if (rating === 'Moderate') return 3
  if (rating === 'Bad') return 2
  if (rating === 'Unrated') return 0
  const num = parseInt(rating)
  return isNaN(num) ? 0 : num
}

interface StarRatingProps {
  rating: string | null | undefined
  onChange?: (ratingValue: string) => void
  editable?: boolean
  size?: number
}

export function StarRating({ rating, onChange, editable = true, size = 16 }: StarRatingProps) {
  const currentStars = getStarCount(rating)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const handleStarClick = (stars: number) => {
    if (editable && onChange) {
      onChange(stars.toString())
    }
  }

  const starsArray = [1, 2, 3, 4, 5]
  const displayRating = hoverRating !== null ? hoverRating : currentStars

  return (
    <div className="flex items-center gap-1">
      {starsArray.map((starNum) => {
        const isFilled = starNum <= displayRating
        return (
          <button
            key={starNum}
            type="button"
            disabled={!editable}
            onClick={() => handleStarClick(starNum)}
            onMouseEnter={() => editable && setHoverRating(starNum)}
            onMouseLeave={() => editable && setHoverRating(null)}
            className={`p-0.5 rounded-md transition-all duration-150 flex items-center justify-center ${
              editable 
                ? 'cursor-pointer hover:scale-115 active:scale-95' 
                : 'cursor-default'
            }`}
            aria-label={`Rate ${starNum} out of 5 stars`}
          >
            <Star
              style={{ width: size, height: size }}
              className={`transition-colors duration-150 ${
                isFilled
                  ? 'fill-[#FFB020] text-[#FFB020]'
                  : 'text-gray-500 fill-transparent'
              }`}
            />
          </button>
        )
      })}
      
      {editable && currentStars > 0 && (
        <button
          type="button"
          onClick={() => onChange && onChange('Unrated')}
          className="ml-1.5 p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
          title="Clear Rating"
          aria-label="Clear Rating"
        >
          <Eraser style={{ width: size * 0.9, height: size * 0.9 }} />
        </button>
      )}
    </div>
  )
}
