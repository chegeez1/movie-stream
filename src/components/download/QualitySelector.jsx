import React from 'react'
import { CheckCircle } from 'lucide-react'
import { QUALITY_OPTIONS } from '../../constants/api'
import QualityBadge from '../movies/QualityBadge'
import '../../styles/components/quality-selector.css'

const QualitySelector = ({
  sources = [],
  selectedQuality,
  onQualitySelect,
  className = ''
}) => {
  const availableQualities = QUALITY_OPTIONS.filter(quality =>
    sources.some(source => source.quality === quality.value)
  )

  if (
