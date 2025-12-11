import React from 'react'
import { GraduationCap, Cpu, Stethoscope, Building2, Gavel, Briefcase, Zap, Calculator, RadioTower } from 'lucide-react'

export const getProgramIcon = (name) => {
    if (!name) return <GraduationCap className="text-blue-600 dark:text-blue-400" size={28} />

    const n = name.toLowerCase()
    if (n.includes('sistema') || n.includes('comput')) return <Cpu className="text-blue-600 dark:text-blue-400" size={28} />
    if (n.includes('enfermer') || n.includes('salud') || n.includes('medicin')) return <Stethoscope className="text-red-500 dark:text-red-400" size={28} />
    if (n.includes('civil') || n.includes('arquitect')) return <Building2 className="text-amber-600 dark:text-amber-400" size={28} />
    if (n.includes('derecho') || n.includes('ley')) return <Gavel className="text-yellow-700 dark:text-yellow-500" size={28} />
    if (n.includes('administra') || n.includes('gerencia')) return <Briefcase className="text-emerald-600 dark:text-emerald-400" size={28} />
    if (n.includes('electric') || n.includes('electron')) return <Zap className="text-yellow-500 dark:text-yellow-300" size={28} />
    if (n.includes('contad') || n.includes('econom')) return <Calculator className="text-cyan-600 dark:text-cyan-400" size={28} />
    if (n.includes('telecom')) return <RadioTower className="text-blue-600 dark:text-blue-400" size={28} />

    return <GraduationCap className="text-blue-600 dark:text-blue-400" size={28} />
}
