function passwordMasking(pwd: string): string {
  return pwd.replace(/./g, '*')
}

export function passwordMaskingForList(args: string[]): string[] {
  const maskedArgs = [...args]
  for(let i = 1; i < maskedArgs.length; i++) {
    if(maskedArgs[i-1] === '--dashscope_api_key' || maskedArgs[i-1] === '--translation_api_key' || maskedArgs[i-1] === '-gkey') {
      maskedArgs[i] = passwordMasking(maskedArgs[i])
    }
  }
  return maskedArgs
}

export function passwordMaskingForObject(args: object): Record<string, unknown> {
  const maskedArgs: Record<string, unknown> = {...args}
  for(const key in maskedArgs) {
    const lKey = key.toLowerCase()
    const value = maskedArgs[key]
    if(lKey.includes('api') && lKey.includes('key') && typeof value === 'string') {
      maskedArgs[key] = passwordMasking(value)
    }
  }
  return maskedArgs
}
