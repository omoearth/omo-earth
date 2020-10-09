import {prisma} from "./prisma";
import {KeyGenerator} from "@omo/auth-utils/dist/keyGenerator";

export class Agent
{
  /**
   * Creates a new agent together with an identity.
   * The private key will be generated by the system and is kept in plain text.
   * @param email
   */
  static async createFromEmail(email: string)
  {
    const keyPair = await KeyGenerator.generateRsaKeyPair();

    return prisma.agent.create({
      data: {
        type: "email",
        key: email,
        identityPrivateKey: keyPair.privateKeyPem,
        identity: {
          create: {
            identityPublicKey: keyPair.publicKeyPem,
            privateData: "",
            publicData: {}
          }
        }
      }
    });
  }

  /**
   * Creates a new agent together with an identity.
   * The supplied data is used to create the identity.
   * The 'identityPrivateKey' must be passed only encrypted.
   * This method is also used to add a new agent to an existing identity.
   * @param agentPublicKey
   * @param identityPublicKey
   * @param identityPrivateKey The private key for the identity, already encrypted with the 'agentPublicKey' by the agent.
   */
  static async createFromPublicKey(agentPublicKey: string, identityPublicKey: string, identityPrivateKey: string)
  {
    let identity = await prisma.identity.findOne({where: {identityPublicKey: identityPublicKey}});
    if (!identity)
    {
      // Create a new identity with the passed data
      identity = await prisma.identity.create({
        data: {
          identityPublicKey: identityPublicKey,
          privateData: "",
          publicData: {}
        }
      });
    }

    return prisma.agent.create({
      data: {
        identity: {
          connect: {
            identityPublicKey: identity.identityPublicKey
          }
        },
        identityPrivateKey: identityPrivateKey,
        key: agentPublicKey,
        type: "publicKey"
      }
    });
  }

  static async remove(type: string, key: string)
  {
    await prisma.agent.delete({
      where: {
        UX_Agent_Type_Key: {
          type: type,
          key: key
        }
      }
    });
  }
}