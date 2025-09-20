import * as bcrypt from 'bcrypt'

export const hashPassword = async (password: string): Promise<string> => {

    const salt: number = Number(process.env.SALT);
    if (isNaN(salt)) throw new Error("Salt rounds should be a number.");
    return await bcrypt.hash(password, salt)

}