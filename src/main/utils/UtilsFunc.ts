function passwordMasking(pwd: string) {
  return pwd.replace(/./g, '*')
}

export function passwordMaskingForList(args: string[]) {
  const maskedArgs = [...args]
  for(let i = 1; i < maskedArgs.length; i++) {
    if(maskedArgs[i-1] === '-k' || maskedArgs[i-1] === '-okey' || maskedArgs[i-1] === '-gkey') {
      maskedArgs[i] = passwordMasking(maskedArgs[i])
    }
  }
  return maskedArgs
}

export function passwordMaskingForObject(args: Record<string, any>) {
  const maskedArgs = {...args}
  for(const key in maskedArgs) {
    const lKey = key.toLowerCase()
    if(lKey.includes('api') && lKey.includes('key')) {
      maskedArgs[key] = passwordMasking(maskedArgs[key])
    }
  }
  return maskedArgs
}
