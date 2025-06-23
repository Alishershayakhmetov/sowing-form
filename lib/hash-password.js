import { hash } from 'bcrypt'

async function main() {
  const password = 'admin'
  const hashed = await hash(password, 10)
  console.log('\n\nHashed password:', hashed)
}

main()
